import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    verifyToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('register should return new user id', async () => {
    authServiceMock.register.mockResolvedValue(101);

    await expect(
      controller.register({
        firstname: 'Fid',
        lastname: 'Zulu',
        username: 'fidzulu',
        email: 'user@example.com',
        password: 'Passw0rd!',
        role: 'USER',
      }),
    ).resolves.toEqual({ userId: 101 });
  });

  it('login should pass email/password/ip and return token details', async () => {
    authServiceMock.login.mockResolvedValue({
      token: 'jwt.token',
      userId: 7,
      role: 'USER',
    });

    await expect(
      controller.login(
        {
          email: 'user@example.com',
          password: 'Passw0rd!',
        },
        '127.0.0.1',
      ),
    ).resolves.toEqual({ token: 'jwt.token', userId: 7, role: 'USER' });

    expect(authServiceMock.login).toHaveBeenCalledWith(
      'user@example.com',
      'Passw0rd!',
      '127.0.0.1',
    );
  });

  it('refreshToken should return token wrapper', async () => {
    authServiceMock.refreshToken.mockResolvedValue('new.jwt.token');

    await expect(
      controller.refreshToken({ oldToken: 'old.jwt.token', event: 'REFRESH' }),
    ).resolves.toEqual({ token: 'new.jwt.token' });
  });

  it('verifyToken should return verification details', async () => {
    authServiceMock.verifyToken.mockResolvedValue({
      isValid: true,
      event: 'LOGIN',
      userId: 7,
      role: 'USER',
      sessionExpireDate: 1740902400,
    });

    await expect(
      controller.verifyToken({ token: 'jwt.token' }),
    ).resolves.toEqual({
      isValid: true,
      event: 'LOGIN',
      userId: 7,
      role: 'USER',
      sessionExpireDate: 1740902400,
    });
  });

  it('logout should return success message', async () => {
    authServiceMock.logout.mockResolvedValue(undefined);

    await expect(controller.logout({ token: 'jwt.token' })).resolves.toEqual({
      message: 'Logout successful',
    });

    expect(authServiceMock.logout).toHaveBeenCalledWith('jwt.token');
  });
});
