import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ORACLE_DB } from '../providers/oracle.provider';
import { UserFromIdResponseDto } from './dto/get-user-from-id.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(ORACLE_DB)
    private readonly pool: oracledb.Pool,
  ) {}

  async getUserFromId(userId: number): Promise<UserFromIdResponseDto> {
    const connection = await this.pool.getConnection();

    try {
      const result = await connection.execute(
        `
        BEGIN
          FIDZULU.auth_pkg.getUserFromID(
            p_user_id => :userId,
            p_firstname => :firstname,
            p_lastname => :lastname,
            p_username => :username,
            p_email => :email,
            p_role => :role
          );
        END;
        `,
        {
          userId,
          firstname: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          lastname: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          username: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          email: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 320 },
          role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        },
      );

      return {
        userId,
        firstname: (result.outBinds?.firstname as string) ?? '',
        lastname: (result.outBinds?.lastname as string) ?? '',
        username: (result.outBinds?.username as string) ?? '',
        email: (result.outBinds?.email as string) ?? '',
        role: (result.outBinds?.role as string) ?? '',
      };
    } catch (error) {
      this.handleOracleError(error);
    } finally {
      await connection.close();
    }
  }

  private handleOracleError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'errorNum' in error &&
      typeof (error as { errorNum?: unknown }).errorNum === 'number'
    ) {
      const err = error as { errorNum: number; message?: string };
      const message = err.message ?? 'Database error';

      if (err.errorNum >= 20000 && err.errorNum < 20300) {
        throw new BadRequestException(message);
      }

      throw new InternalServerErrorException(message);
    }

    if (error instanceof Error) {
      throw new InternalServerErrorException(error.message);
    }

    throw new InternalServerErrorException('Unknown database error');
  }
}
