import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { TestSessionsService } from './test-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/test-sessions')
@UseGuards(JwtAuthGuard)
export class TestSessionsController {
  constructor(private readonly testSessionsService: TestSessionsService) {}

  @Post('start')
  startSession(@Request() req, @Body('department_id') departmentId: number) {
    const deptId = departmentId || req.user.department_id;
    return this.testSessionsService.startSession(req.user.id, deptId);
  }

  @Get(':id')
  getSessionDetails(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.testSessionsService.getSessionDetails(id, req.user.id);
  }

  @Post(':id/answer')
  saveAnswer(
    @Request() req,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() body: { question_id: number; selected_option_id?: number; answer_text?: string },
  ) {
    return this.testSessionsService.saveAnswer(sessionId, req.user.id, body.question_id, body);
  }

  @Post(':id/anti-cheat-event')
  logAntiCheatEvent(
    @Request() req,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() body: { event_type: string; details?: any },
  ) {
    return this.testSessionsService.logAntiCheatEvent(sessionId, req.user.id, body.event_type, body.details);
  }

  @Post(':id/submit')
  submitSession(
    @Request() req,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.testSessionsService.submitSession(sessionId, req.user.id);
  }

  @Get(':id/results')
  getResults(
    @Request() req,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.testSessionsService.getResultSummary(sessionId, userId);
  }
}

