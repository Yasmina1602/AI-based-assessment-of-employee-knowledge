import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getDashboardStats() {
    return this.resultsService.getDashboardStats();
  }

  @Get('leaderboard')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getLeaderboard(@Query('department_id') departmentId?: string) {
    return this.resultsService.getLeaderboard(
      departmentId ? parseInt(departmentId, 10) : undefined,
    );
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllResults(
    @Query('department_id') departmentId?: string,
    @Query('is_passed') isPassed?: string,
  ) {
    return this.resultsService.getAllResults({
      department_id: departmentId ? parseInt(departmentId, 10) : undefined,
      is_passed: isPassed !== undefined ? isPassed === 'true' : undefined,
    });
  }

  @Get('my')
  getMyResults(@Request() req) {
    return this.resultsService.getMyResults(req.user.id);
  }
}

