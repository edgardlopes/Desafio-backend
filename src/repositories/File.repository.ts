import { Injectable } from '@nestjs/common';
import { ConnectionPool } from 'src/db/ConnectionPool';
import { File, FileStatus } from 'src/model/File';

@Injectable()
export class FileRepository {
  constructor(private pool: ConnectionPool) {}

  async save(file: File): Promise<string> {
    const result = await this.pool.getPool().query(
      `
      INSERT INTO files (file_name, status) VALUES($1, $2) RETURNING id;
    `,
      [file.fileName, file.status],
    );

    return result.rows[0].id;
  }

  async readById(id: number): Promise<File> {
    const result = await this.pool.getPool().query(
      `
      SELECT id, file_name, status FROM files WHERE id=$1;
    `,
      [id],
    );

    return {
      fileName: result.rows[0]['file_name'],
      id: result.rows[0]['id'],
      status: result.rows[0]['status'],
    };
  }

  async readAll(): Promise<File[]> {
    const result = await this.pool.getPool().query(
      `
      SELECT id, file_name, status FROM files ORDER BY id DESC;
    `,
    );

    return result.rows.map((row) => ({
      fileName: row['file_name'],
      id: row['id'],
      status: row['status'],
    }));
  }

  async updateStatus(fileId: number, status: FileStatus) {
    await this.pool.getPool().query(
      `
      UPDATE files SET status=$1 WHERE id=$2;
    `,
      [status, fileId],
    );
  }
}
