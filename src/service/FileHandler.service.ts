import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { ConnectionPool } from '../db/ConnectionPool';
import { File, FileStatus } from '../model/File';
import { FileRepository } from '../repositories/File.repository';
import { DebtRepository } from '../repositories/Debt.repository';
import { Debt } from '../model/Debt';

@Injectable()
@Processor('file-process')
export class FileConsumer {
  private readonly logger = new Logger(FileConsumer.name);

  constructor(
    private fileRepository: FileRepository,
    private debtRepository: DebtRepository,
  ) {}

  @Process()
  async transcode(job: Job<File>) {
    this.logger.log(`Starting to process file ${job.data.id}`);
    const client = new S3Client({});

    await this.fileRepository.updateStatus(job.data.id, FileStatus.PROCESSING);

    const out = await client.send(
      new GetObjectCommand({
        Key: `${job.data.id}-${job.data.fileName}`,
        Bucket: 'infrastack-infrabucket5cec4531-1mnt48kysipc7',
      }),
    );

    const stream = out.Body as Readable;

    const chunkSize = 5000;

    const chunkInsert: Debt[] = [];
    let count = 0;

    let i = 0;
    stream
      .pipe(csv())
      .on('data', async (chunk: Debt) => {
        if (!chunk.debtId) return;
        chunkInsert.push({ ...chunk, fileId: job.data.id });

        if (chunkInsert.length === chunkSize) {
          this.logger.log(`inserting ${chunkInsert.length} items`, i++);
          stream.pause();

          await this.debtRepository.insertBatch(chunkInsert);
          chunkInsert.splice(0);
          count = 0;
          job.progress(i);

          setTimeout(() => {
            stream.resume();
          }, 500);
        }
      })
      .on('close', async () => {
        this.logger.log(`Storing ${chunkInsert.length} remaining items`);
        await this.debtRepository.insertBatch(chunkInsert);

        job.finished();
        await this.fileRepository.updateStatus(
          job.data.id,
          FileStatus.PROCESSED,
        );
      })
      .on(
        'error',
        async () =>
          await this.fileRepository.updateStatus(
            job.data.id,
            FileStatus.ERROR_ON_PROCESS,
          ),
      )
      .on('pause', () => this.logger.log('paused'))
      .on('resume', () => this.logger.log('resumed'));
  }
}
