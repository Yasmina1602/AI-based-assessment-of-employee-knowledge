import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { DocumentsModule } from './documents/documents.module';
import { QuestionsModule } from './questions/questions.module';
import { TestSessionsModule } from './test-sessions/test-sessions.module';
import { ResultsModule } from './results/results.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    DepartmentsModule,
    DocumentsModule,
    QuestionsModule,
    TestSessionsModule,
    ResultsModule,
  ],
})
export class AppModule {}

