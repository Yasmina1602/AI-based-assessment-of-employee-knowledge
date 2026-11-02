import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/employee_assessment_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      this.logger.log('Connected to PostgreSQL successfully.');
      client.release();
    } catch (err) {
      this.logger.error(`Database connection error: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database pool closed.');
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn(`Slow query (${duration}ms): ${text}`);
      }
      return res;
    } catch (error) {
      this.logger.error(`Query failed: ${text} - Error: ${error.message}`);
      throw error;
    }
  }
}

