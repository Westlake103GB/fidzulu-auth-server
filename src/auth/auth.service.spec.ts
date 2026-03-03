import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ORACLE_DB } from '../providers/oracle.provider';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const executeMock = jest.fn();
  const closeMock = jest.fn();
  const getConnectionMock = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    getConnectionMock.mockResolvedValue({
      execute: executeMock,
      close: closeMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ORACLE_DB,
          useValue: {
            getConnection: getConnectionMock,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('register should return user id from out bind', async () => {
    executeMock.mockResolvedValue({ outBinds: { result: 101 } });

    await expect(
      service.register({
        firstname: 'Fid',
        lastname: 'Zulu',
        username: 'fidzulu',
        email: 'user@example.com',
        password: 'Passw0rd!',
        role: 'USER',
      }),
    ).resolves.toBe(101);

    expect(getConnectionMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  it('login should map token/user/role output', async () => {
    executeMock.mockResolvedValue({
      outBinds: {
        token: 'jwt.token',
        userId: 5,
        role: 'ADMIN',
      },
    });

    await expect(
      service.login('user@example.com', 'Passw0rd!', '127.0.0.1'),
    ).resolves.toEqual({
      token: 'jwt.token',
      userId: 5,
      role: 'ADMIN',
    });
  });

  it('login should support guest login when email and password are omitted', async () => {
    executeMock.mockResolvedValue({
      outBinds: {
        token: 'guest.jwt.token',
        userId: 0,
        role: 'GUEST',
      },
    });

    await expect(service.login(undefined, undefined, '127.0.0.1')).resolves.toEqual({
      token: 'guest.jwt.token',
      userId: 0,
      role: 'GUEST',
    });

    expect(executeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        email: null,
        password: null,
        ip: '127.0.0.1',
      }),
    );
  });

  it('refreshToken should return refreshed token string', async () => {
    executeMock.mockResolvedValue({ outBinds: { result: 'new.token' } });

    await expect(
      service.refreshToken({ oldToken: 'old.token', event: 'REFRESH' }),
    ).resolves.toBe('new.token');
  });

  it('verifyToken should map full verification payload', async () => {
    executeMock.mockResolvedValue({
      outBinds: {
        isValid: true,
        event: 'LOGIN',
        userId: 2,
        role: 'USER',
        sessionExpireDate: 1740902400,
      },
    });

    await expect(service.verifyToken('jwt.token')).resolves.toEqual({
      isValid: true,
      event: 'LOGIN',
      userId: 2,
      role: 'USER',
      sessionExpireDate: 1740902400,
    });
  });

  it('logout should execute without return payload', async () => {
    executeMock.mockResolvedValue({});

    await expect(service.logout('jwt.token')).resolves.toBeUndefined();
  });

  it('should map ORA-20xxx (<=20199) to BadRequestException', async () => {
    executeMock.mockRejectedValue({ errorNum: 20100, message: 'Invalid credentials' });

    await expect(service.login('a@b.com', 'x', '127.0.0.1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should map ORA-202xx to UnauthorizedException', async () => {
    executeMock.mockRejectedValue({ errorNum: 20201, message: 'Invalid token' });

    await expect(
      service.refreshToken({ oldToken: 'old.token', event: 'REFRESH' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
