import { Injectable, Logger } from '@nestjs/common';
import * as pg from 'pg';

const URL =
  process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

@Injectable()
export class ConnectionPool {
  private readonly logger = new Logger(ConnectionPool.name);

  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      connectionString: URL,
      max: Number(process.env.DB_POOL) || 200,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('error', () => {
      this.logger.log('oooppss');
    });

    this.pool.once('connect', () => {
      this.logger.log('Connected to DB');
      this.pool.query(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          status INTEGER NOT NULL DEFAULT 1 
        );

        CREATE TABLE IF NOT EXISTS debts (
            debtId uuid  NOT NULL,
            debtDueDate DATE NOT NULL,
            debtAmount  INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            governmentId VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            file_id INTEGER NOT NULL,


            CONSTRAINT table_fk FOREIGN KEY(file_id) REFERENCES files(id)
        );


    `);
    });

    this.connect();
  }

  private async connect() {
    try {
      this.logger.log(`Connecting to db ${URL}`);
      await this.pool.connect();
    } catch (err) {
      setTimeout(() => {
        this.connect();
        this.logger.log(
          `database.js: an error occured when connecting ${err} retrying connection on 3 secs`,
        );
      }, 3000);
    }
  }

  getPool(): pg.Pool {
    return this.pool;
  }
}
