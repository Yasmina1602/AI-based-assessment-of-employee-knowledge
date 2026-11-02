import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(
    @Query('department_id') departmentId?: string,
    @Query('question_type') questionType?: string,
    @Query('status') status?: string,
  ) {
    return this.questionsService.findAll({
      department_id: departmentId ? parseInt(departmentId, 10) : undefined,
      question_type: questionType,
      status: status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.setStatus(id, 'approved');
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.setStatus(id, 'rejected');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.delete(id);
  }
}

