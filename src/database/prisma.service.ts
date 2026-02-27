import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed.');
  }

  async enableShutdownHooks(app: { close: () => Promise<void> }): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
