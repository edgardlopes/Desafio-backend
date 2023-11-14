import { Module } from '@nestjs/common';
import { FileRepository } from './repositories/File.repository';
import { FileController } from './controller/File.controller';
import { BullModule } from '@nestjs/bull';
import { FileConsumer } from './service/FileHandler.service';
import { ConnectionPool } from './db/ConnectionPool';
import { DebtRepository } from './repositories/Debt.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_POST) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'file-process',
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [FileController],
  providers: [
    FileRepository,
    FileConsumer,
    ConnectionPool,
    FileRepository,
    DebtRepository,
  ],
})
export class AppModule {}
