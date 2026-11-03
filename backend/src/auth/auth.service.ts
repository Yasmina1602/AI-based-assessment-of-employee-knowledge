import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
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
      // 0. Ensure roles table and seed roles (superadmin, admin, xodim)
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO roles (name, title, description)
        VALUES 
        ('superadmin', 'Super Administrator', 'Tizimning to''liq boshqaruvi va administratorlarni tayinlash huquqi'),
        ('admin', 'HR Administrator', 'Bo''limlar, normativ hujjatlar, test savollari va natijalarni boshqarish'),
        ('xodim', 'Xodim', 'Test topshirish, o''z natijalari va tahlillarini ko''rish')
        ON CONFLICT (name) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
      `);

      // Ensure users table has role_id column
      await this.db.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT REFERENCES roles(id) ON DELETE SET NULL;
        UPDATE users u SET role_id = r.id FROM roles r WHERE u.role = r.name AND u.role_id IS NULL;
      `);

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

      // 2. Seed Superadmin user if not exists
      const superRes = await this.db.query("SELECT * FROM users WHERE username = 'superadmin'");
      if (!superRes.rows[0]) {
        const hash = await bcrypt.hash('admin123', 10);
        const roleRes = await this.db.query("SELECT id FROM roles WHERE name = 'superadmin'");
        const roleId = roleRes.rows[0]?.id;
        await this.db.query(`
          INSERT INTO users (username, password_hash, full_name, role, role_id)
          VALUES ('superadmin', $1, 'Bosh Administrator (Superadmin)', 'superadmin', $2);
        `, [hash, roleId]);
        this.logger.log('Default superadmin seeded: superadmin / admin123');
      }

      // 3. Seed Admin user if not exists
      const adminRes = await this.db.query("SELECT * FROM users WHERE username = 'admin'");
      if (!adminRes.rows[0]) {
        const hash = await bcrypt.hash('admin123', 10);
        const roleRes = await this.db.query("SELECT id FROM roles WHERE name = 'admin'");
        const roleId = roleRes.rows[0]?.id;
        await this.db.query(`
          INSERT INTO users (username, password_hash, full_name, role, role_id)
          VALUES ('admin', $1, 'Tizim Administratori (HR)', 'admin', $2);
        `, [hash, roleId]);
        this.logger.log('Default admin seeded: admin / admin123');
      }

      // 4. Seed Demo Xodim user if not exists
      const xodimRes = await this.db.query("SELECT * FROM users WHERE username = 'xodim'");
      if (!xodimRes.rows[0]) {
        const hash = await bcrypt.hash('xodim123', 10);
        const deptRes = await this.db.query("SELECT id FROM departments LIMIT 1");
        const deptId = deptRes.rows[0] ? deptRes.rows[0].id : null;
        const roleRes = await this.db.query("SELECT id FROM roles WHERE name = 'xodim'");
        const roleId = roleRes.rows[0]?.id;
        await this.db.query(`
          INSERT INTO users (username, password_hash, full_name, role, role_id, department_id)
          VALUES ('xodim', $1, 'Aliyev Vali (Xodim)', 'xodim', $2, $3);
        `, [hash, roleId, deptId]);
        this.logger.log('Default employee seeded: xodim / xodim123');
      }
    } catch (e) {
      this.logger.error(`Error in seedInitialData: ${e.message}`);
    }
  }

  async login(username: string, pass: string) {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.role, u.role_id, u.department_id,
              d.name as department_name, r.title as role_title
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.name
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
      role_id: user.role_id,
      department_id: user.department_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        role_id: user.role_id,
        role_title: user.role_title || (user.role === 'superadmin' ? 'Super Administrator' : user.role === 'admin' ? 'HR Administrator' : 'Xodim'),
        department_id: user.department_id,
        department_name: user.department_name,
      },
    };
  }

  // --- ROLES & ADMIN MANAGEMENT (Superadmin Only) ---

  async getRoles() {
    const res = await this.db.query('SELECT * FROM roles ORDER BY id ASC');
    return res.rows;
  }

  async getAdmins() {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.role_id, u.created_at,
              COALESCE(r.title, u.role) as role_title, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.name
       WHERE u.role IN ('admin', 'superadmin')
       ORDER BY (CASE WHEN u.role = 'superadmin' THEN 1 ELSE 2 END), u.created_at ASC`
    );
    return res.rows;
  }

  async createAdmin(data: {
    username: string;
    password: string;
    full_name: string;
    role?: string;
  }) {
    const existing = await this.db.query(
      'SELECT id FROM users WHERE username = $1',
      [data.username]
    );
    if (existing.rows[0]) {
      throw new BadRequestException('Bu login allaqachon mavjud');
    }

    const targetRole = data.role === 'superadmin' ? 'superadmin' : 'admin';
    const roleRes = await this.db.query('SELECT id FROM roles WHERE name = $1', [targetRole]);
    const roleId = roleRes.rows[0]?.id;

    const hash = await bcrypt.hash(data.password, 10);
    const res = await this.db.query(
      `INSERT INTO users (username, password_hash, full_name, role, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, full_name, role, role_id, created_at`,
      [data.username, hash, data.full_name, targetRole, roleId]
    );
    return res.rows[0];
  }

  async updateAdmin(
    id: number,
    data: {
      username?: string;
      password?: string;
      full_name?: string;
      role?: string;
    },
    currentUserId: number
  ) {
    const adminRes = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!adminRes.rows[0]) {
      throw new NotFoundException('Administrator topilmadi');
    }

    if (data.username && data.username !== adminRes.rows[0].username) {
      const existing = await this.db.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [data.username, id]
      );
      if (existing.rows[0]) {
        throw new BadRequestException('Bu login allaqachon boshqa foydalanuvchi tomonidan band qilingan');
      }
    }

    // Role safety: Cannot demote yourself if you are the last superadmin
    let newRole = adminRes.rows[0].role;
    if (data.role && ['admin', 'superadmin'].includes(data.role)) {
      if (adminRes.rows[0].role === 'superadmin' && data.role !== 'superadmin') {
        const countRes = await this.db.query("SELECT COUNT(*) FROM users WHERE role = 'superadmin'");
        if (parseInt(countRes.rows[0].count) <= 1) {
          throw new BadRequestException("Oxirgi Superadminning rolini o'zgartirib bo'lmaydi");
        }
      }
      newRole = data.role;
    }

    const roleRes = await this.db.query('SELECT id FROM roles WHERE name = $1', [newRole]);
    const roleId = roleRes.rows[0]?.id;

    let passwordHash = adminRes.rows[0].password_hash;
    if (data.password && data.password.trim().length > 0) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const username = data.username || adminRes.rows[0].username;
    const fullName = data.full_name || adminRes.rows[0].full_name;

    const updateRes = await this.db.query(
      `UPDATE users
       SET username = $1, password_hash = $2, full_name = $3, role = $4, role_id = $5
       WHERE id = $6
       RETURNING id, username, full_name, role, role_id, created_at`,
      [username, passwordHash, fullName, newRole, roleId, id]
    );

    return updateRes.rows[0];
  }

  async deleteAdmin(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException("O'z hisobingizni o'chira olmaysiz");
    }

    const adminRes = await this.db.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!adminRes.rows[0]) {
      throw new NotFoundException('Administrator topilmadi');
    }

    if (adminRes.rows[0].role === 'superadmin') {
      const countRes = await this.db.query("SELECT COUNT(*) FROM users WHERE role = 'superadmin'");
      if (parseInt(countRes.rows[0].count) <= 1) {
        throw new BadRequestException("Oxirgi Superadminni o'chirish mumkin emas");
      }
    }

    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true, message: "Administrator muvaffaqiyatli o'chirildi" };
  }

  // --- EMPLOYEE MANAGEMENT (Admin & Superadmin) ---

  async registerEmployee(data: {
    username: string;
    password: string;
    full_name: string;
    department_id: number;
  }) {
    const existing = await this.db.query(
      'SELECT id FROM users WHERE username = $1',
      [data.username]
    );
    if (existing.rows[0]) {
      throw new BadRequestException('Bu login allaqachon mavjud');
    }

    const roleRes = await this.db.query("SELECT id FROM roles WHERE name = 'xodim'");
    const roleId = roleRes.rows[0]?.id;

    const hash = await bcrypt.hash(data.password, 10);
    const res = await this.db.query(
      `INSERT INTO users (username, password_hash, full_name, role, role_id, department_id)
       VALUES ($1, $2, $3, 'xodim', $4, $5)
       RETURNING id, username, full_name, role, role_id, department_id`,
      [data.username, hash, data.full_name, roleId, data.department_id]
    );
    return res.rows[0];
  }

  async getAllUsers() {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.role_id, u.department_id, u.created_at,
              d.name as department_name, r.title as role_title
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.name
       ORDER BY u.created_at DESC`
    );
    return res.rows;
  }

  async getUsersByDepartment(departmentId: number) {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.role_id, u.department_id, u.created_at,
              d.name as department_name, r.title as role_title
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.name
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
    }
  ) {
    const userRes = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!userRes.rows[0]) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (userRes.rows[0].role === 'admin' || userRes.rows[0].role === 'superadmin') {
      throw new ForbiddenException("Administrator hisobini faqat Superadmin boshqara oladi");
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

    const updateRes = await this.db.query(
      `UPDATE users
       SET username = $1, password_hash = $2, full_name = $3, department_id = $4
       WHERE id = $5
       RETURNING id, username, full_name, role, role_id, department_id, created_at`,
      [username, passwordHash, fullName, departmentId, id]
    );

    return updateRes.rows[0];
  }

  async deleteUser(id: number) {
    const userRes = await this.db.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!userRes.rows[0]) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    if (userRes.rows[0].role === 'admin' || userRes.rows[0].role === 'superadmin') {
      throw new ForbiddenException("Administrator hisobini xodimlar bo'limidan o'chirish mumkin emas. Superadmin panelidan foydalaning.");
    }
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true, message: "Xodim muvaffaqiyatli o'chirildi" };
  }
}
