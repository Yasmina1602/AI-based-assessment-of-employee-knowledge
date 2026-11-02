import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.departmentsService.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.delete(id);
  }
}

