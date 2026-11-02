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
      'SELECT id, username, full_name, role, department_id, level FROM users WHERE id = $1',
      [payload.sub]
    );
    if (!res.rows[0]) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    return res.rows[0];
  }
}

