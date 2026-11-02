import { Module } from '@nestjs/common';
import { TestSessionsService } from './test-sessions.service';
import { TestSessionsController } from './test-sessions.controller';

@Module({
  providers: [TestSessionsService],
  controllers: [TestSessionsController],
  exports: [TestSessionsService],
})
export class TestSessionsModule {}

