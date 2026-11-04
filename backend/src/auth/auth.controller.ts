import { Controller, Post, Body, Get, Put, Delete, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username?: string; login?: string; password: string }) {
    const user = body.username || body.login || '';
    return this.authService.login(user, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // --- ROLES (Admin & Superadmin) ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('roles')
  async getRoles() {
    return this.authService.getRoles();
  }

  // --- SUPERADMIN ONLY: ADMIN MANAGEMENT ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Get('admins')
  async getAdmins() {
    return this.authService.getAdmins();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Post('admins')
  async createAdmin(@Body() body: {
    username: string;
    password: string;
    full_name: string;
    role?: string;
  }) {
    return this.authService.createAdmin(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Put('admins/:id')
  async updateAdmin(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      username?: string;
      password?: string;
      full_name?: string;
      role?: string;
    },
  ) {
    return this.authService.updateAdmin(id, body, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete('admins/:id')
  async deleteAdmin(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.authService.deleteAdmin(id, req.user.id);
  }

  // --- EMPLOYEE MANAGEMENT (Admin & Superadmin) ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register-employee')
  async registerEmployee(@Body() body: {
    username: string;
    password: string;
    full_name: string;
    department_id: number;
  }) {
    return this.authService.registerEmployee(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('departments/:deptId/employees')
  async getDepartmentEmployees(@Param('deptId', ParseIntPipe) deptId: number) {
    return this.authService.getUsersByDepartment(deptId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      username?: string;
      password?: string;
      full_name?: string;
      department_id?: number;
    },
  ) {
    return this.authService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteUser(id);
  }
}
