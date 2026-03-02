import { FactoryProvider } from '@nestjs/common';
import * as oracledb from 'oracledb';

export const ORACLE_DB = 'ORACLE_DB';

export const oracleProvider: FactoryProvider<oracledb.Pool> = {
  provide: ORACLE_DB,
  useFactory: async (): Promise<oracledb.Pool> => {
    const pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      connectString: process.env.DB_CONNECT_STRING,
    });
    return pool;
  },
};
