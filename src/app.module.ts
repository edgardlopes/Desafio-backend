import { Module } from '@nestjs/common';
import { FileRepository } from './repositories/File.repository';
import { FileController } from './controller/File.controller';
import { BullModule } from '@nestjs/bull';
import { FileConsumer } from './service/FileHandler.service';
import { ConnectionPool } from './db/ConnectionPool';
import { DebtRepository } from './repositories/Debt.repository';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'file-process',
    }),
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
