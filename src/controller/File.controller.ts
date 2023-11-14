import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Response } from 'express';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { FileRepository } from 'src/repositories/File.repository';
import { File, FileStatus } from 'src/model/File';

@Controller('files')
export class FileController {
  private client = new S3Client({});

  constructor(
    @InjectQueue('file-process') private fileQueue: Queue,
    private repository: FileRepository,
  ) {}

  @Post()
  async uploadFile(@Body() file: File) {
    const createdId = await this.repository.save({
      fileName: file.fileName,
      status: FileStatus.WAITING_FOR_PROCESS,
    });

    const command = new PutObjectCommand({
      Bucket: 'infrastack-infrabucket5cec4531-1mnt48kysipc7',
      Key: `${createdId}-${file.fileName}`,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });

    return { url, fileId: createdId };
  }

  @Post('start-process/:id')
  async startProcess(@Param('id') id: number, @Res() res: Response) {
    const file = await this.repository.readById(id);
    this.fileQueue.add(file);

    res.sendStatus(200);
  }

  @Get()
  async listAll() {
    const files = await this.repository.readAll();
    return files;
  }
}
