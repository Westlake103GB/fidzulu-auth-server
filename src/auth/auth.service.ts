import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ORACLE_DB } from '../providers/oracle.provider';
import { LoginResponseDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyTokenResponseDto } from './dto/verify-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ORACLE_DB)
    private readonly pool: oracledb.Pool,
  ) {}

  async register(payload: RegisterUserDto): Promise<number> {
    return this.executeWithConnection(async (connection) => {
      try {
        const result = await connection.execute(
          `
          BEGIN
            :result := FIDZULU.auth_pkg.register_user(
              p_firstname => :firstname,
              p_lastname => :lastname,
              p_username => :username,
              p_email => :email,
              p_password => :password,
              p_role => :role
            );
          END;
          `,
          {
            result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            firstname: payload.firstname,
            lastname: payload.lastname,
            username: payload.username,
            email: payload.email,
            password: payload.password,
            role: payload.role ?? 'USER',
          },
          { autoCommit: true },
        );

        const userId = result.outBinds?.result as number | undefined;

        if (typeof userId !== 'number') {
          throw new InternalServerErrorException('Failed to register user');
        }

        return userId;
      } catch (error) {
        this.handleOracleError(error);
      }
    });
  }

  async login(
    email: string | undefined,
    password: string | undefined,
    ipAddress: string,
  ): Promise<LoginResponseDto> {
    return this.executeWithConnection(async (connection) => {
      try {
        const normalizedIp = this.normalizeIpForOracle(ipAddress);

        const result = await connection.execute(
          `
          BEGIN
            :token := FIDZULU.auth_pkg.login_user(
              p_email => :email,
              p_password => :password,
              p_ip => :ip,
              p_user_id => :userId,
              p_role => :role
            );
          END;
          `,
          {
            token: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
            email: email ?? null,
            password: password ?? null,
            ip: normalizedIp,
            userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
          },
        );

        return {
          token: (result.outBinds?.token as string) ?? '',
          userId: (result.outBinds?.userId as number) ?? 0,
          role: (result.outBinds?.role as string) ?? '',
        };
      } catch (error) {
        this.handleOracleError(error);
      }
    });
  }

  private normalizeIpForOracle(ipAddress: string | undefined): string {
    if (typeof ipAddress !== 'string') {
      return '';
    }

    let normalizedIp = ipAddress.trim();

    if (normalizedIp.startsWith('::ffff:')) {
      normalizedIp = normalizedIp.slice('::ffff:'.length);
    } else if (normalizedIp === '::1') {
      normalizedIp = '127.0.0.1';
    }

    return normalizedIp.length <= 16 ? normalizedIp : '';
  }

  async refreshToken(payload: RefreshTokenDto): Promise<string> {
    return this.executeWithConnection(async (connection) => {
      try {
        const result = await connection.execute(
          `
          BEGIN
            :result := FIDZULU.auth_pkg.refresh_token(
              p_old_token => :oldToken,
              event => :event
            );
          END;
          `,
          {
            result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
            oldToken: payload.oldToken,
            event: payload.event ?? 'REFRESH',
          },
        );

        return (result.outBinds?.result as string) ?? '';
      } catch (error) {
        this.handleOracleError(error);
      }
    });
  }

  async verifyToken(token: string): Promise<VerifyTokenResponseDto> {
    return this.executeWithConnection(async (connection) => {
      try {
        const result = await connection.execute(
          `
          BEGIN
            :isValid := FIDZULU.auth_pkg.verify_token(
              p_token => :token,
              p_event => :event,
              p_user_id => :userId,
              p_role => :role,
              p_ses_expiredate => :sessionExpireDate
            );
          END;
          `,
          {
            isValid: { dir: oracledb.BIND_OUT, type: oracledb.DB_TYPE_BOOLEAN },
            token,
            event: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
            userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
            sessionExpireDate: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          },
        );

        return {
          isValid: Boolean(result.outBinds?.isValid),
          event: (result.outBinds?.event as string | null) ?? null,
          userId: (result.outBinds?.userId as number | null) ?? null,
          role: (result.outBinds?.role as string | null) ?? null,
          sessionExpireDate:
            (result.outBinds?.sessionExpireDate as number | null) ?? null,
        };
      } catch (error) {
        this.handleOracleError(error);
      }
    });
  }

  async logout(token: string): Promise<void> {
    await this.executeWithConnection(async (connection) => {
      try {
        await connection.execute(
          `
          BEGIN
            FIDZULU.auth_pkg.logout(p_token => :token);
          END;
          `,
          { token },
        );
      } catch (error) {
        this.handleOracleError(error);
      }
    });
  }

  private async executeWithConnection<T>(
    handler: (connection: oracledb.Connection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      return await handler(connection);
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

      if (err.errorNum >= 20000 && err.errorNum < 20200) {
        throw new BadRequestException(message);
      }

      if (err.errorNum >= 20200 && err.errorNum < 20300) {
        throw new UnauthorizedException(message);
      }

      throw new InternalServerErrorException(message);
    }

    if (error instanceof Error) {
      throw new InternalServerErrorException(error.message);
    }

    throw new InternalServerErrorException('Unknown database error');
  }
}
