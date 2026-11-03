import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedInitialData();
  }

  async seedInitialData() {
    try {
      // 1. Seed initial departments if empty
      const depts = await this.db.query('SELECT COUNT(*) FROM departments');
      if (parseInt(depts.rows[0].count) === 0) {
        await this.db.query(`
          INSERT INTO departments (name, description, test_duration_minutes, total_questions, closed_questions_count, open_questions_count, passing_score)
          VALUES 
          ('Buxgalteriya', 'Buxgalteriya hisobi, hisobotlar va moliyaviy audit reglamentlari', 30, 30, 25, 5, 60),
          ('Davlat xizmatlari', 'Davlat xizmatlari ko''rsatish standartlari va qonunchilik', 30, 30, 25, 5, 60),
          ('Axborot texnologiyalari (IT)', 'Axborot xavfsizligi, dasturiy ta''minot va tizim boshqaruvi', 30, 30, 25, 5, 60);
        `);
        this.logger.log('Initial departments seeded.');
      }

      // 2. Seed Admin user if not exists
      const adminRes = await this.db.query("SELECT * FROM users WHERE username = 'admin'");
      if (!adminRes.rows[0]) {
        const hash = await bcrypt.hash('admin123', 10);
        await this.db.query(`
          INSERT INTO users (username, password_hash, full_name, role)
          VALUES ('admin', $1, 'Tizim Administratori (HR)', 'admin');
        `, [hash]);
        this.logger.log('Default admin seeded: admin / admin123');
      }

      // 3. Seed Demo Xodim user if not exists
      const xodimRes = await this.db.query("SELECT * FROM users WHERE username = 'xodim'");
      if (!xodimRes.rows[0]) {
        const hash = await bcrypt.hash('xodim123', 10);
        const deptRes = await this.db.query("SELECT id FROM departments LIMIT 1");
        const deptId = deptRes.rows[0] ? deptRes.rows[0].id : null;
        await this.db.query(`
          INSERT INTO users (username, password_hash, full_name, role, department_id, level)
          VALUES ('xodim', $1, 'Aliyev Vali (Xodim)', 'xodim', $2, 'Middle');
        `, [hash, deptId]);
        this.logger.log('Default employee seeded: xodim / xodim123');
      }
    } catch (e) {
      this.logger.error(`Error in seedInitialData: ${e.message}`);
    }
  }

  async login(username: string, pass: string) {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.role, u.department_id, u.level, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = $1`,
      [username]
    );
    const user = res.rows[0];
    if (!user) {
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      department_id: user.department_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        department_id: user.department_id,
        department_name: user.department_name,
        level: user.level,
      },
    };
  }

  async registerEmployee(data: {
    username: string;
    password: string;
    full_name: string;
    department_id: number;
    level?: string;
  }) {
    const existing = await this.db.query(
      'SELECT id FROM users WHERE username = $1',
      [data.username]
    );
    if (existing.rows[0]) {
      throw new BadRequestException('Bu login allaqachon mavjud');
    }

    const hash = await bcrypt.hash(data.password, 10);
    const res = await this.db.query(
      `INSERT INTO users (username, password_hash, full_name, role, department_id, level)
       VALUES ($1, $2, $3, 'xodim', $4, $5)
       RETURNING id, username, full_name, role, department_id, level`,
      [data.username, hash, data.full_name, data.department_id, data.level || 'Middle']
    );
    return res.rows[0];
  }

  async getAllUsers() {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.department_id, u.level, u.created_at, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    );
    return res.rows;
  }

  async getUsersByDepartment(departmentId: number) {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.department_id, u.level, u.created_at, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.department_id = $1 AND u.role = 'xodim'
       ORDER BY u.full_name ASC`,
      [departmentId]
    );
    return res.rows;
  }

  async updateUser(
    id: number,
    data: {
      username?: string;
      password?: string;
      full_name?: string;
      department_id?: number;
      level?: string;
    }
  ) {
    const userRes = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!userRes.rows[0]) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (data.username && data.username !== userRes.rows[0].username) {
      const existing = await this.db.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [data.username, id]
      );
      if (existing.rows[0]) {
        throw new BadRequestException('Bu login allaqachon boshqa foydalanuvchi tomonidan band qilingan');
      }
    }

    let passwordHash = userRes.rows[0].password_hash;
    if (data.password && data.password.trim().length > 0) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const username = data.username || userRes.rows[0].username;
    const fullName = data.full_name || userRes.rows[0].full_name;
    const departmentId = data.department_id !== undefined ? data.department_id : userRes.rows[0].department_id;
    const level = data.level || userRes.rows[0].level || 'Middle';

    const updateRes = await this.db.query(
      `UPDATE users
       SET username = $1, password_hash = $2, full_name = $3, department_id = $4, level = $5
       WHERE id = $6
       RETURNING id, username, full_name, role, department_id, level, created_at`,
      [username, passwordHash, fullName, departmentId, level, id]
    );

    return updateRes.rows[0];
  }

  async deleteUser(id: number) {
    const userRes = await this.db.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!userRes.rows[0]) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    if (userRes.rows[0].role === 'admin') {
      throw new BadRequestException("Administrator hisobini o'chirish mumkin emas");
    }
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true, message: "Xodim muvaffaqiyatli o'chirildi" };
  }
}
