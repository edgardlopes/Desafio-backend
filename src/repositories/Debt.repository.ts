import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPool } from 'src/db/ConnectionPool';
import { Debt } from 'src/model/Debt';
import { File, FileStatus } from 'src/model/File';

const COLUMNS = 7;

@Injectable()
export class DebtRepository {
  private readonly logger = new Logger(ConnectionPool.name);

  constructor(private pool: ConnectionPool) {}

  async insertBatch(debts: Debt[]) {
    if (!debts.length) {
      this.logger.log('Empty list, wont persist');
      return;
    }

    const slots = this.expand(debts.length, COLUMNS);
    const array = debts.map((debt) => {
      return [
        debt.name,
        debt.governmentId,
        debt.email,
        debt.debtAmount,
        debt.debtDueDate,
        debt.debtId,
        debt.fileId,
      ];
    });

    const data = this.flatten(array);

    const query = `
    INSERT INTO debts
        ("name",governmentId,email,debtAmount,debtDueDate,debtId, file_id)
    VALUES
        ${slots};
  `;

    try {
      await this.pool.getPool().query(query, data);
    } catch (error) {
      console.error(error);
    }
  }

  private expand(rowCount, columnCount, startAt = 1) {
    let index = startAt;
    return Array(rowCount)
      .fill(0)
      .map(
        (v) =>
          `(${Array(columnCount)
            .fill(0)
            .map((v) => `$${index++}`)
            .join(', ')})`,
      )
      .join(', ');
  }

  private flatten(arr) {
    const newArr = [];
    arr.forEach((v) => newArr.push(...v));
    return newArr;
  }
}
