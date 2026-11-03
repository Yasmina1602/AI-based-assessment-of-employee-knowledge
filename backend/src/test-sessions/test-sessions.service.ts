import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';
import { randomBytes } from 'crypto';

@Injectable()
export class TestSessionsService {
  private readonly logger = new Logger(TestSessionsService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

  constructor(private readonly db: DatabaseService) {}

  /**
   * Testni boshlash (Start session)
   */
  async startSession(userId: number, departmentId: number) {
    // 1. Check if user already has an active session
    const existing = await this.db.query(
      `SELECT * FROM test_sessions 
       WHERE user_id = $1 AND status = 'in_progress' 
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    const now = new Date();
    if (existing.rows[0]) {
      const sess = existing.rows[0];
      const expiresAt = new Date(sess.expires_at);
      if (expiresAt > now) {
        this.logger.log(`User ${userId} resuming active session ${sess.id}`);
        return this.getSessionDetails(sess.id, userId);
      } else {
        // Expired, auto-submit
        this.logger.log(`Session ${sess.id} expired, auto submitting...`);
        await this.submitSession(sess.id, userId, true);
      }
    }

    // 2. Fetch department test settings
    const deptRes = await this.db.query('SELECT * FROM departments WHERE id = $1', [departmentId]);
    if (!deptRes.rows[0]) {
      throw new NotFoundException("Bo'lim topilmadi");
    }
    const dept = deptRes.rows[0];
    const durationMinutes = dept.test_duration_minutes || 30;
    const closedCount = dept.closed_questions_count || 25;
    const openCount = dept.open_questions_count || 5;

    // 3. Fetch approved closed questions randomly
    const closedRes = await this.db.query(
      `SELECT q.*,
        (SELECT json_agg(json_build_object(
          'id', opt.id,
          'option_text', opt.option_text,
          'is_correct', opt.is_correct
        )) FROM question_options opt WHERE opt.question_id = q.id) as options
       FROM questions q
       WHERE q.department_id = $1 AND q.question_type = 'closed' AND q.status = 'approved'
       ORDER BY RANDOM()
       LIMIT $2`,
      [departmentId, closedCount]
    );

    // 4. Fetch approved open questions randomly
    const openRes = await this.db.query(
      `SELECT q.*, '[]'::json as options
       FROM questions q
       WHERE q.department_id = $1 AND q.question_type = 'open' AND q.status = 'approved'
       ORDER BY RANDOM()
       LIMIT $2`,
      [departmentId, openCount]
    );

    const allQuestions = [...closedRes.rows, ...openRes.rows];
    if (allQuestions.length === 0) {
      throw new BadRequestException("Ushbu bo'lim uchun tasdiqlangan savollar mavjud emas. HR admin hujjat yuklashi yoki savollar qo'shishi kerak.");
    }

    // 5. Create new session
    const sessionToken = randomBytes(24).toString('hex');
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const sessionRes = await this.db.query(
      `INSERT INTO test_sessions (
        session_token, user_id, department_id, status, total_questions, started_at, expires_at
      )
      VALUES ($1, $2, $3, 'in_progress', $4, $5, $6)
      RETURNING *`,
      [sessionToken, userId, departmentId, allQuestions.length, now, expiresAt]
    );
    const session = sessionRes.rows[0];

    // 6. Snapshot questions into session_questions
    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i];
      await this.db.query(
        `INSERT INTO session_questions (session_id, question_id, question_order, question_snapshot)
         VALUES ($1, $2, $3, $4)`,
        [session.id, q.id, i + 1, JSON.stringify(q)]
      );
    }

    return this.getSessionDetails(session.id, userId);
  }

  /**
   * Sessiya tafsilotlarini qaytarish.
   * XAVFSIZLIK: Xodimga to'g'ri javoblar (is_correct) va baholash mezonlari ASLO yuborilmaydi!
   */
  async getSessionDetails(sessionId: number, userId: number) {
    const sessRes = await this.db.query(
      `SELECT s.*, d.name as department_name, d.passing_score
       FROM test_sessions s
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [sessionId, userId]
    );
    if (!sessRes.rows[0]) {
      throw new NotFoundException('Sessiya topilmadi');
    }
    const session = sessRes.rows[0];

    const questionsRes = await this.db.query(
      `SELECT sq.question_order, sq.question_id, sq.question_snapshot,
              a.selected_option_id, a.answer_text
       FROM session_questions sq
       LEFT JOIN answers a ON a.session_id = sq.session_id AND a.question_id = sq.question_id
       WHERE sq.session_id = $1
       ORDER BY sq.question_order ASC`,
      [sessionId]
    );

    const sanitizedQuestions = questionsRes.rows.map((row) => {
      const snap = typeof row.question_snapshot === 'string' 
        ? JSON.parse(row.question_snapshot) 
        : row.question_snapshot;

      // Anti-Cheat Sanitization
      const cleanOptions = Array.isArray(snap.options)
        ? snap.options.map((opt: any) => ({
            id: opt.id,
            option_text: opt.option_text,
          }))
        : [];

      return {
        order: row.question_order,
        id: row.question_id,
        question_text: snap.question_text,
        question_type: snap.question_type,
        level: snap.level,
        difficulty: snap.difficulty,
        options: cleanOptions,
        saved_selected_option_id: row.selected_option_id,
        saved_answer_text: row.answer_text,
      };
    });

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return {
      session_id: session.id,
      session_token: session.session_token,
      department_name: session.department_name,
      passing_score: session.passing_score,
      status: session.status,
      cheat_warnings_count: session.cheat_warnings_count,
      remaining_seconds: remainingSeconds,
      started_at: session.started_at,
      expires_at: session.expires_at,
      total_questions: session.total_questions,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Xodimning oraliq javobini saqlab borish (Avto-save)
   */
  async saveAnswer(sessionId: number, userId: number, questionId: number, data: {
    selected_option_id?: number;
    answer_text?: string;
  }) {
    const sessRes = await this.db.query(
      "SELECT * FROM test_sessions WHERE id = $1 AND user_id = $2 AND status = 'in_progress'",
      [sessionId, userId]
    );
    if (!sessRes.rows[0]) {
      throw new BadRequestException('Faol test sessiyasi topilmadi');
    }

    // Check expiry
    const now = new Date();
    if (new Date(sessRes.rows[0].expires_at) < now) {
      await this.submitSession(sessionId, userId, true);
      throw new BadRequestException('Test vaqti tugagan');
    }

    // Upsert answer
    await this.db.query(
      `INSERT INTO answers (session_id, question_id, selected_option_id, answer_text, submitted_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [sessionId, questionId, data.selected_option_id || null, data.answer_text || null]
    );

    // Update if already exists
    const updateRes = await this.db.query(
      `UPDATE answers 
       SET selected_option_id = $1, answer_text = $2, submitted_at = NOW()
       WHERE session_id = $3 AND question_id = $4
       RETURNING id`,
      [data.selected_option_id || null, data.answer_text || null, sessionId, questionId]
    );

    if (updateRes.rowCount === 0) {
      await this.db.query(
        `INSERT INTO answers (session_id, question_id, selected_option_id, answer_text, submitted_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [sessionId, questionId, data.selected_option_id || null, data.answer_text || null]
      );
    }

    return { success: true };
  }

  /**
   * Anti-Cheat hodisasini qayd etish
   */
  async logAntiCheatEvent(sessionId: number, userId: number, eventType: string, details?: any) {
    const sessRes = await this.db.query(
      'SELECT id, cheat_warnings_count, status FROM test_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    if (!sessRes.rows[0] || sessRes.rows[0].status !== 'in_progress') {
      return { warning_count: 0, terminated: false };
    }

    // Record event
    await this.db.query(
      `INSERT INTO anti_cheat_logs (session_id, user_id, event_type, details)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, userId, eventType, JSON.stringify(details || {})]
    );

    // Increment warnings
    const newCount = (sessRes.rows[0].cheat_warnings_count || 0) + 1;
    let terminated = false;

    if (newCount >= 3) {
      // Auto-terminate session on 3 cheat attempts!
      terminated = true;
      await this.db.query(
        `UPDATE test_sessions 
         SET status = 'cancelled_cheat', cheat_warnings_count = $1, completed_at = NOW(), is_passed = FALSE, percentage = 0
         WHERE id = $2`,
        [newCount, sessionId]
      );
      this.logger.warn(`Session ${sessionId} terminated due to exceeding cheat warnings (${newCount})!`);
    } else {
      await this.db.query(
        'UPDATE test_sessions SET cheat_warnings_count = $1 WHERE id = $2',
        [newCount, sessionId]
      );
    }

    return {
      warning_count: newCount,
      max_warnings: 3,
      terminated,
      message: terminated 
        ? 'Test qoidalarni ketma-ket buzganligingiz sababli bekor qilindi!' 
        : `Diqqat! Qoidabuzarlik aniqlandi (${newCount}/3). 3-ogohlantirishdan so'ng test avtomatik yakunlanadi!`,
    };
  }

  /**
   * Testni yakunlash va to'liq baholash (Submit & Full Evaluation)
   */
  async submitSession(sessionId: number, userId: number, isTimeout: boolean = false) {
    const sessRes = await this.db.query(
      'SELECT * FROM test_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    if (!sessRes.rows[0]) {
      throw new NotFoundException('Sessiya topilmadi');
    }
    const session = sessRes.rows[0];

    if (session.status === 'completed' || session.status === 'cancelled_cheat') {
      return this.getResultSummary(sessionId, userId);
    }

    this.logger.log(`Evaluating test session ${sessionId} for user ${userId}...`);

    // Fetch snapshot questions and submitted answers
    const sqRes = await this.db.query(
      `SELECT sq.question_order, sq.question_id, sq.question_snapshot,
              a.id as answer_id, a.selected_option_id, a.answer_text
       FROM session_questions sq
       LEFT JOIN answers a ON a.session_id = sq.session_id AND a.question_id = sq.question_id
       WHERE sq.session_id = $1
       ORDER BY sq.question_order ASC`,
      [sessionId]
    );

    let closedCorrectCount = 0;
    let closedTotalCount = 0;
    let openScoresSum = 0;
    let openTotalCount = 0;

    for (const row of sqRes.rows) {
      const snap = typeof row.question_snapshot === 'string'
        ? JSON.parse(row.question_snapshot)
        : row.question_snapshot;

      if (snap.question_type === 'closed') {
        closedTotalCount++;
        const correctOpt = Array.isArray(snap.options)
          ? snap.options.find((o: any) => o.is_correct === true)
          : null;

        const isCorrect = correctOpt && row.selected_option_id === correctOpt.id;
        const score = isCorrect ? 1 : 0;
        if (isCorrect) closedCorrectCount++;

        // Update answer record
        if (row.answer_id) {
          await this.db.query(
            'UPDATE answers SET is_correct = $1, score = $2 WHERE id = $3',
            [isCorrect, score, row.answer_id]
          );
        } else {
          await this.db.query(
            `INSERT INTO answers (session_id, question_id, selected_option_id, is_correct, score)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, row.question_id, row.selected_option_id || null, isCorrect, score]
          );
        }

      } else if (snap.question_type === 'open') {
        openTotalCount++;
        const answerText = row.answer_text || '';

        let evalResult = {
          score: 1,
          explanation: 'Javob berilmagan',
          strengths: [],
          weaknesses: ["Bo'sh qoldirilgan"],
          missing_points: [],
          confidence: 1.0,
        };

        if (answerText.trim().length > 0) {
          try {
            this.logger.log(`Evaluating open question ${row.question_id} via AI microservice...`);
            const aiRes = await axios.post(`${this.aiServiceUrl}/api/evaluate/open-question`, {
              department_id: session.department_id,
              question: snap.question_text,
              employee_answer: answerText,
              evaluation_criteria: snap.evaluation_criteria || '',
              sample_answer: snap.sample_answer || '',
            }, { timeout: 30000 });

            if (aiRes.data && typeof aiRes.data.score === 'number') {
              evalResult = aiRes.data;
            }
          } catch (e) {
            this.logger.error(`AI evaluation failed for question ${row.question_id}: ${e.message}`);
            evalResult.explanation = "AI baholash vaqtinchalik javob bermadi, tekshirish HR ga yo'naltirildi.";
          }
        }

        const score = evalResult.score;
        openScoresSum += score;

        if (row.answer_id) {
          await this.db.query(
            'UPDATE answers SET score = $1, ai_evaluation = $2 WHERE id = $3',
            [score, JSON.stringify(evalResult), row.answer_id]
          );
        } else {
          await this.db.query(
            `INSERT INTO answers (session_id, question_id, answer_text, score, ai_evaluation)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, row.question_id, answerText, score, JSON.stringify(evalResult)]
          );
        }
      }
    }

    // Calculate final weighted percentage
    // Closed max: closedTotalCount * 1
    // Open max: openTotalCount * 5
    const totalMax = (closedTotalCount * 1) + (openTotalCount * 5);
    const totalEarned = (closedCorrectCount * 1) + openScoresSum;
    const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

    const deptRes = await this.db.query('SELECT passing_score FROM departments WHERE id = $1', [session.department_id]);
    const passingScore = deptRes.rows[0]?.passing_score || 60;
    const isPassed = percentage >= passingScore;

    const finalStatus = isTimeout ? 'timed_out' : 'completed';

    await this.db.query(
      `UPDATE test_sessions 
       SET status = $1, completed_at = NOW(), total_score = $2, closed_score = $3, 
           open_score = $4, percentage = $5, is_passed = $6
       WHERE id = $7`,
      [finalStatus, totalEarned, closedCorrectCount, openScoresSum, percentage, isPassed, sessionId]
    );

    this.logger.log(`Session ${sessionId} evaluated: ${percentage}% (Passed: ${isPassed})`);
    return this.getResultSummary(sessionId, userId);
  }

  /**
   * Natijalar xulosasi
   */
  async getResultSummary(sessionId: number, userId?: number) {
    let query = `
      SELECT s.*, u.full_name as employee_name, u.username as employee_username,
             d.name as department_name, d.passing_score
      FROM test_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE s.id = $1
    `;
    const params: any[] = [sessionId];
    if (userId) {
      query += ' AND s.user_id = $2';
      params.push(userId);
    }

    const sessRes = await this.db.query(query, params);
    if (!sessRes.rows[0]) {
      throw new NotFoundException('Natija topilmadi');
    }
    const session = sessRes.rows[0];

    // Fetch detailed answers
    const answersRes = await this.db.query(
      `SELECT sq.question_order, sq.question_snapshot,
              a.selected_option_id, a.answer_text, a.is_correct, a.score, a.ai_evaluation
       FROM session_questions sq
       LEFT JOIN answers a ON a.session_id = sq.session_id AND a.question_id = sq.question_id
       WHERE sq.session_id = $1
       ORDER BY sq.question_order ASC`,
      [sessionId]
    );

    // Fetch anti-cheat logs for this session
    const logsRes = await this.db.query(
      `SELECT id, event_type, details, COALESCE(created_at, timestamp, NOW()) as created_at
       FROM anti_cheat_logs
       WHERE session_id = $1
       ORDER BY COALESCE(created_at, timestamp, NOW()) ASC`,
      [sessionId]
    );

    return {
      session: {
        id: session.id,
        employee_name: session.employee_name,
        employee_username: session.employee_username,
        department_name: session.department_name,
        status: session.status,
        started_at: session.started_at,
        completed_at: session.completed_at,
        total_questions: session.total_questions,
        total_score: session.total_score,
        closed_score: session.closed_score,
        open_score: session.open_score,
        percentage: session.percentage,
        passing_score: session.passing_score,
        is_passed: session.is_passed,
        cheat_warnings_count: session.cheat_warnings_count,
      },
      anti_cheat_logs: logsRes.rows,
      details: answersRes.rows.map((r) => {
        const snap = typeof r.question_snapshot === 'string'
          ? JSON.parse(r.question_snapshot)
          : r.question_snapshot;
        const aiEval = typeof r.ai_evaluation === 'string'
          ? JSON.parse(r.ai_evaluation)
          : r.ai_evaluation;

        return {
          order: r.question_order,
          question_text: snap.question_text,
          question_type: snap.question_type,
          level: snap.level,
          explanation: snap.explanation,
          evaluation_criteria: snap.evaluation_criteria,
          sample_answer: snap.sample_answer,
          options: snap.options,
          selected_option_id: r.selected_option_id,
          answer_text: r.answer_text,
          is_correct: r.is_correct,
          score: r.score,
          ai_evaluation: aiEval,
        };
      }),
    };
  }
}
