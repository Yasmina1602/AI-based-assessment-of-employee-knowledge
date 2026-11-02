import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ResultsService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardStats() {
    // 1. Overall test sessions summary
    const sessionsSummary = await this.db.query(`
      SELECT 
        COUNT(*) as total_tests,
        COUNT(CASE WHEN is_passed = TRUE THEN 1 END) as passed_tests,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_tests,
        COUNT(CASE WHEN status = 'cancelled_cheat' THEN 1 END) as cheat_cancelled_tests,
        COALESCE(AVG(percentage), 0) as average_percentage
      FROM test_sessions
      WHERE status IN ('completed', 'timed_out', 'cancelled_cheat')
    `);

    // 2. Total employees count
    const empSummary = await this.db.query(`
      SELECT COUNT(*) as total_employees FROM users WHERE role = 'xodim'
    `);

    // 3. Departments performance
    const deptStats = await this.db.query(`
      SELECT d.id, d.name,
        COUNT(s.id) as tests_count,
        COALESCE(AVG(s.percentage), 0) as avg_score,
        COUNT(CASE WHEN s.is_passed = TRUE THEN 1 END) as passed_count
      FROM departments d
      LEFT JOIN test_sessions s ON s.department_id = d.id AND s.status IN ('completed', 'timed_out')
      GROUP BY d.id, d.name
      ORDER BY d.id ASC
    `);

    // 4. Recent tests
    const recentTests = await this.db.query(`
      SELECT s.id, s.percentage, s.is_passed, s.status, s.completed_at, s.cheat_warnings_count,
             u.full_name as employee_name, u.username, d.name as department_name
      FROM test_sessions s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      ORDER BY s.started_at DESC
      LIMIT 10
    `);

    return {
      stats: {
        total_employees: parseInt(empSummary.rows[0].total_employees, 10),
        total_tests: parseInt(sessionsSummary.rows[0].total_tests, 10),
        passed_tests: parseInt(sessionsSummary.rows[0].passed_tests, 10),
        active_tests: parseInt(sessionsSummary.rows[0].active_tests, 10),
        cheat_cancelled_tests: parseInt(sessionsSummary.rows[0].cheat_cancelled_tests, 10),
        average_percentage: Math.round(parseFloat(sessionsSummary.rows[0].average_percentage)),
      },
      departments: deptStats.rows.map((d) => ({
        id: d.id,
        name: d.name,
        tests_count: parseInt(d.tests_count, 10),
        avg_score: Math.round(parseFloat(d.avg_score)),
        passed_count: parseInt(d.passed_count, 10),
      })),
      recent_tests: recentTests.rows,
    };
  }

  async getAllResults(filters: { department_id?: number; is_passed?: boolean }) {
    let query = `
      SELECT s.id, s.percentage, s.total_score, s.closed_score, s.open_score,
             s.is_passed, s.status, s.started_at, s.completed_at, s.cheat_warnings_count,
             u.full_name as employee_name, u.username, d.name as department_name
      FROM test_sessions s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE s.status IN ('completed', 'timed_out', 'cancelled_cheat')
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (filters.department_id) {
      query += ` AND s.department_id = $${pIdx++}`;
      params.push(filters.department_id);
    }
    if (filters.is_passed !== undefined) {
      query += ` AND s.is_passed = $${pIdx++}`;
      params.push(filters.is_passed);
    }

    query += ' ORDER BY s.completed_at DESC';
    const res = await this.db.query(query, params);
    return res.rows;
  }

  async getMyResults(userId: number) {
    const res = await this.db.query(
      `SELECT s.id, s.percentage, s.total_score, s.closed_score, s.open_score,
              s.is_passed, s.status, s.started_at, s.completed_at, s.cheat_warnings_count,
              d.name as department_name, d.passing_score
       FROM test_sessions s
       JOIN departments d ON s.department_id = d.id
       WHERE s.user_id = $1 AND s.status IN ('completed', 'timed_out', 'cancelled_cheat')
       ORDER BY s.completed_at DESC`,
      [userId]
    );
    return res.rows;
  }
}

