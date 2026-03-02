import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ORACLE_DB } from '../src/providers/oracle.provider';

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication;

  const executeMock = jest.fn();
  const closeMock = jest.fn();
  const getConnectionMock = jest.fn();

  beforeAll(async () => {
    getConnectionMock.mockResolvedValue({
      execute: executeMock,
      close: closeMock,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ORACLE_DB)
      .useValue({
        getConnection: getConnectionMock,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    executeMock.mockImplementation((sql: string) => {
      if (sql.includes('register_user')) {
        return Promise.resolve({ outBinds: { result: 101 } });
      }

      if (sql.includes('login_user')) {
        return Promise.resolve({
          outBinds: {
            token: 'jwt.token',
            userId: 101,
            role: 'USER',
          },
        });
      }

      if (sql.includes('refresh_token')) {
        return Promise.resolve({ outBinds: { result: 'new.jwt.token,USER_ID=101' } });
      }

      if (sql.includes('verify_token')) {
        return Promise.resolve({
          outBinds: {
            isValid: true,
            event: 'LOGIN',
            userId: 101,
            role: 'USER',
            sessionExpireDate: 1740902400,
          },
        });
      }

      if (sql.includes('auth_pkg.logout')) {
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Fid',
        lastname: 'Zulu',
        username: 'fidzulu',
        email: 'user@example.com',
        password: 'Passw0rd!',
        role: 'USER',
      })
      .expect(201)
      .expect({ userId: 101 });
  });

  it('POST /auth/login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Passw0rd!',
      })
      .expect(201)
      .expect({ token: 'jwt.token', userId: 101, role: 'USER' });
  });

  it('POST /auth/refresh-token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({ oldToken: 'old.jwt.token', event: 'REFRESH' })
      .expect(201)
      .expect({ token: 'new.jwt.token,USER_ID=101' });
  });

  it('POST /auth/verify-token', async () => {
    await request(app.getHttpServer())
      .post('/auth/verify-token')
      .send({ token: 'jwt.token' })
      .expect(201)
      .expect({
        isValid: true,
        event: 'LOGIN',
        userId: 101,
        role: 'USER',
        sessionExpireDate: 1740902400,
      });
  });

  it('POST /auth/logout', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ token: 'jwt.token' })
      .expect(201)
      .expect({ message: 'Logout successful' });
  });
});
