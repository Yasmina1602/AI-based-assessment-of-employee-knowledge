import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_employee_assessment_jwt_key_2026_xyz',
    });
  }

  async validate(payload: any) {
    const res = await this.db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.role_id, u.department_id, r.title as role_title
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.name
       WHERE u.id = $1`,
      [payload.sub]
    );
    if (!res.rows[0]) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    return res.rows[0];
  }
}

