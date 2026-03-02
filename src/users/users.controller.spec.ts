import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    getUserFromId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('getUserFromId should return user details', async () => {
    usersServiceMock.getUserFromId.mockResolvedValue({
      userId: 10,
      firstname: 'Fid',
      lastname: 'Zulu',
      username: 'fidzulu',
      email: 'user@example.com',
      role: 'USER',
    });

    await expect(controller.getUserFromId(10)).resolves.toEqual({
      userId: 10,
      firstname: 'Fid',
      lastname: 'Zulu',
      username: 'fidzulu',
      email: 'user@example.com',
      role: 'USER',
    });

    expect(usersServiceMock.getUserFromId).toHaveBeenCalledWith(10);
  });
});
