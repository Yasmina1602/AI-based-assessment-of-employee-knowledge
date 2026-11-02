import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(filters: {
    department_id?: number;
    question_type?: string;
    status?: string;
  }) {
    let query = `
      SELECT q.*, d.name as department_name, doc.title as document_title,
        (SELECT json_agg(json_build_object(
          'id', opt.id,
          'option_text', opt.option_text,
          'is_correct', opt.is_correct
        )) FROM question_options opt WHERE opt.question_id = q.id) as options
      FROM questions q
      LEFT JOIN departments d ON q.department_id = d.id
      LEFT JOIN documents doc ON q.document_id = doc.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (filters.department_id) {
      query += ` AND q.department_id = $${pIdx++}`;
      params.push(filters.department_id);
    }
    if (filters.question_type) {
      query += ` AND q.question_type = $${pIdx++}`;
      params.push(filters.question_type);
    }
    if (filters.status) {
      query += ` AND q.status = $${pIdx++}`;
      params.push(filters.status);
    }

    query += ' ORDER BY q.created_at DESC';
    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findOne(id: number) {
    const res = await this.db.query(
      `SELECT q.*,
        (SELECT json_agg(json_build_object(
          'id', opt.id,
          'option_text', opt.option_text,
          'is_correct', opt.is_correct
        )) FROM question_options opt WHERE opt.question_id = q.id) as options
       FROM questions q
       WHERE q.id = $1`,
      [id]
    );
    if (!res.rows[0]) {
      throw new NotFoundException('Savol topilmadi');
    }
    return res.rows[0];
  }

  async create(data: {
    department_id: number;
    question_text: string;
    question_type: 'closed' | 'open';
    level?: string;
    difficulty?: string;
    explanation?: string;
    evaluation_criteria?: string;
    sample_answer?: string;
    options?: { text: string; is_correct: boolean }[];
  }) {
    const res = await this.db.query(
      `INSERT INTO questions (
        department_id, question_text, question_type, level, 
        difficulty, status, explanation, evaluation_criteria, sample_answer
      )
      VALUES ($1, $2, $3, $4, $5, 'approved', $6, $7, $8)
      RETURNING *`,
      [
        data.department_id,
        data.question_text,
        data.question_type,
        data.level || 'Middle',
        data.difficulty || 'medium',
        data.explanation || '',
        data.evaluation_criteria || '',
        data.sample_answer || '',
      ]
    );
    const question = res.rows[0];

    if (data.question_type === 'closed' && Array.isArray(data.options)) {
      for (const opt of data.options) {
        await this.db.query(
          `INSERT INTO question_options (question_id, option_text, is_correct)
           VALUES ($1, $2, $3)`,
          [question.id, opt.text, !!opt.is_correct]
        );
      }
    }

    return this.findOne(question.id);
  }

  async setStatus(id: number, status: 'approved' | 'rejected') {
    await this.findOne(id);
    const res = await this.db.query(
      'UPDATE questions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return res.rows[0];
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.db.query('DELETE FROM questions WHERE id = $1', [id]);
    return { success: true, message: "Savol muvaffaqiyatli o'chirildi" };
  }
}
