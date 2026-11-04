import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

  constructor(private readonly db: DatabaseService) {}

  async findAll(departmentId?: number) {
    let query = `
      SELECT doc.*, d.name as department_name,
        CAST((SELECT COUNT(*) FROM questions q WHERE q.document_id = doc.id) AS INTEGER) as generated_questions_count
      FROM documents doc
      LEFT JOIN departments d ON doc.department_id = d.id
    `;
    const params: any[] = [];
    if (departmentId) {
      query += ' WHERE doc.department_id = $1';
      params.push(departmentId);
    }
    query += ' ORDER BY doc.created_at DESC';
    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findOne(id: number) {
    const res = await this.db.query(
      `SELECT doc.*, d.name as department_name 
       FROM documents doc
       LEFT JOIN departments d ON doc.department_id = d.id
       WHERE doc.id = $1`,
      [id]
    );
    if (!res.rows[0]) {
      throw new NotFoundException('Hujjat topilmadi');
    }
    return res.rows[0];
  }

  async getDocumentContent(id: number) {
    const doc = await this.findOne(id);

    // 1. Try to read chunks from document_chunks
    const chunksRes = await this.db.query(
      `SELECT chunk_index, content FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC`,
      [id]
    );

    let content = '';
    if (chunksRes.rows && chunksRes.rows.length > 0) {
      content = chunksRes.rows.map((r: any) => r.content).join('\n\n--- [Bo\'lak / Qism] ---\n\n');
    } else if (fs.existsSync(doc.file_path)) {
      if (doc.filename.toLowerCase().endsWith('.txt')) {
        content = fs.readFileSync(doc.file_path, 'utf-8');
      } else {
        content = `Ushbu hujjat (${doc.filename}) saqlangan. Hujjat to'liq o'rganilgandan so'ng uning matn qismlari avtomatik shu yerda ko'rinadi. Asl faylni 'Yuklab olish' tugmasi orqali ochishingiz mumkin.`;
      }
    } else {
      content = 'Fayl server diskida topilmadi.';
    }

    return {
      id: doc.id,
      title: doc.title,
      filename: doc.filename,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      status: doc.status,
      chunks_count: doc.chunks_count,
      department_id: doc.department_id,
      department_name: doc.department_name,
      created_at: doc.created_at,
      content,
    };
  }

  async create(file: Express.Multer.File, departmentId: number, title?: string) {
    if (!file) {
      throw new BadRequestException('Fayl yuklanmadi');
    }

    const documentTitle = title || file.originalname;
    const res = await this.db.query(
      `INSERT INTO documents (department_id, title, filename, file_path, file_size, mime_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'uploaded')
       RETURNING *`,
      [
        departmentId,
        documentTitle,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
      ]
    );
    return res.rows[0];
  }

  /**
   * "YANGILASH" (Sync & Learn):
   * AI modeli hujjatni o'rganadi, chunklarga bo'ladi, embeddinglarni hisoblab
   * PostgreSQL bazasiga saqlaydi va hujjat asosida test savollarini shakllantiradi!
   */
  async syncDocument(id: number) {
    const doc = await this.findOne(id);

    // Update status to processing
    await this.db.query("UPDATE documents SET status = 'processing' WHERE id = $1", [id]);

    try {
      if (!fs.existsSync(doc.file_path)) {
        throw new NotFoundException('Fayl server diskida topilmadi');
      }

      const form = new FormData();
      form.append('document_id', String(doc.id));
      form.append('department_id', String(doc.department_id));
      form.append('department_name', doc.department_name || 'Umumiy');
      form.append('closed_count', '25');
      form.append('open_count', '5');
      form.append('file', fs.createReadStream(doc.file_path), {
        filename: doc.filename,
        contentType: doc.mime_type || 'application/octet-stream',
      });

      this.logger.log(`Sending document ${id} to AI microservice for processing (generating 30 questions: 25 closed + 5 open)...`);
      const aiRes = await axios.post(`${this.aiServiceUrl}/api/documents/process`, form, {
        headers: form.getHeaders(),
        timeout: 180000, // 3 minutes for 30 questions + embeddings
      });

      const { total_chunks, generated_questions } = aiRes.data;

      // Update document to learned
      await this.db.query(
        "UPDATE documents SET status = 'learned', chunks_count = $1 WHERE id = $2",
        [total_chunks, id]
      );

      // Clear previous questions for this specific document before inserting fresh ones (safe re-sync)
      await this.db.query('DELETE FROM questions WHERE document_id = $1', [id]);

      // Save generated questions to questions bank if available
      let savedQuestionsCount = 0;
      if (generated_questions) {
        // 1. Closed questions
        if (Array.isArray(generated_questions.closed_questions)) {
          for (const q of generated_questions.closed_questions) {
            const qRes = await this.db.query(
              `INSERT INTO questions (
                department_id, document_id, question_text, question_type, 
                level, difficulty, status, explanation
              )
              VALUES ($1, $2, $3, 'closed', $4, $5, 'approved', $6)
              RETURNING id`,
              [
                doc.department_id,
                doc.id,
                q.question,
                q.level || 'Middle',
                q.difficulty || 'medium',
                q.explanation || '',
              ]
            );
            const questionId = qRes.rows[0].id;
            savedQuestionsCount++;

            if (Array.isArray(q.options)) {
              for (const opt of q.options) {
                await this.db.query(
                  `INSERT INTO question_options (question_id, option_text, is_correct)
                   VALUES ($1, $2, $3)`,
                  [questionId, opt.text, !!opt.is_correct]
                );
              }
            }
          }
        }

        // 2. Open questions
        if (Array.isArray(generated_questions.open_questions)) {
          for (const q of generated_questions.open_questions) {
            await this.db.query(
              `INSERT INTO questions (
                department_id, document_id, question_text, question_type, 
                level, difficulty, status, evaluation_criteria, sample_answer
              )
              VALUES ($1, $2, $3, 'open', $4, $5, 'approved', $6, $7)`,
              [
                doc.department_id,
                doc.id,
                q.question,
                q.level || 'Middle',
                q.difficulty || 'hard',
                q.evaluation_criteria || '',
                q.sample_answer || '',
              ]
            );
            savedQuestionsCount++;
          }
        }
      }

      this.logger.log(`Document ${id} learned successfully! Generated ${savedQuestionsCount} questions.`);
      return {
        success: true,
        message: "Hujjat muvaffaqiyatli o'rganildi va savollar shakllantirildi",
        chunks_count: total_chunks,
        generated_questions_count: savedQuestionsCount,
      };

    } catch (error) {
      await this.db.query("UPDATE documents SET status = 'error' WHERE id = $1", [id]);
      this.logger.error(`Failed to sync document ${id}: ${error.message}`);
      throw new BadRequestException(`Hujjatni o'rganishda xatolik: ${error.response?.data?.detail || error.message}`);
    }
  }

  async delete(id: number) {
    const doc = await this.findOne(id);

    // 1. Delete file on disk if exists
    try {
      if (fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    } catch (e) {
      this.logger.warn(`Could not delete file ${doc.file_path}: ${e.message}`);
    }

    // 2. Notify AI service to delete chunks
    try {
      await axios.delete(`${this.aiServiceUrl}/api/documents/${id}`);
    } catch (e) {
      this.logger.warn(`Could not notify AI service of deleted document ${id}: ${e.message}`);
    }

    // 3. Delete from DB (cascades chunks and sets document_id null on questions)
    await this.db.query('DELETE FROM documents WHERE id = $1', [id]);
    return { success: true, message: "Hujjat muvaffaqiyatli o'chirildi" };
  }
}
