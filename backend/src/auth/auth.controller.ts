import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register-employee')
  async registerEmployee(@Body() body: {
    username: string;
    password: string;
    full_name: string;
    department_id: number;
    level?: string;
  }) {
    return this.authService.registerEmployee(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }
}

