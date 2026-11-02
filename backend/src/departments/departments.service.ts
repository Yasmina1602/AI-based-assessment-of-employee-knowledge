import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const res = await this.db.query(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.department_id = d.id AND q.status = 'approved') as approved_questions_count,
        (SELECT COUNT(*) FROM documents doc WHERE doc.department_id = d.id) as documents_count,
        (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.role = 'xodim') as employees_count
      FROM departments d
      ORDER BY d.id ASC
    `);
    return res.rows;
  }

  async findOne(id: number) {
    const res = await this.db.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (!res.rows[0]) {
      throw new NotFoundException("Bo'lim topilmadi");
    }
    return res.rows[0];
  }

  async create(data: {
    name: string;
    description?: string;
    test_duration_minutes?: number;
    total_questions?: number;
    closed_questions_count?: number;
    open_questions_count?: number;
    passing_score?: number;
  }) {
    const res = await this.db.query(
      `INSERT INTO departments (
        name, description, test_duration_minutes, total_questions, 
        closed_questions_count, open_questions_count, passing_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.name,
        data.description || '',
        data.test_duration_minutes || 30,
        data.total_questions || 30,
        data.closed_questions_count || 25,
        data.open_questions_count || 5,
        data.passing_score || 60,
      ]
    );
    return res.rows[0];
  }

  async update(id: number, data: {
    name?: string;
    description?: string;
    test_duration_minutes?: number;
    total_questions?: number;
    closed_questions_count?: number;
    open_questions_count?: number;
    passing_score?: number;
  }) {
    const current = await this.findOne(id);
    const res = await this.db.query(
      `UPDATE departments 
       SET name = $1, description = $2, test_duration_minutes = $3, 
           total_questions = $4, closed_questions_count = $5, 
           open_questions_count = $6, passing_score = $7
       WHERE id = $8
       RETURNING *`,
      [
        data.name ?? current.name,
        data.description ?? current.description,
        data.test_duration_minutes ?? current.test_duration_minutes,
        data.total_questions ?? current.total_questions,
        data.closed_questions_count ?? current.closed_questions_count,
        data.open_questions_count ?? current.open_questions_count,
        data.passing_score ?? current.passing_score,
        id,
      ]
    );
    return res.rows[0];
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.db.query('DELETE FROM departments WHERE id = $1', [id]);
    return { success: true, message: "Bo'lim muvaffaqiyatli o'chirildi" };
  }
}
