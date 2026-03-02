import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ORACLE_DB } from '../providers/oracle.provider';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

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
        UsersService,
        {
          provide: ORACLE_DB,
          useValue: {
            getConnection: getConnectionMock,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('getUserFromId should map out binds to dto', async () => {
    executeMock.mockResolvedValue({
      outBinds: {
        firstname: 'Fid',
        lastname: 'Zulu',
        username: 'fidzulu',
        email: 'user@example.com',
        role: 'USER',
      },
    });

    await expect(service.getUserFromId(101)).resolves.toEqual({
      userId: 101,
      firstname: 'Fid',
      lastname: 'Zulu',
      username: 'fidzulu',
      email: 'user@example.com',
      role: 'USER',
    });

    expect(closeMock).toHaveBeenCalled();
  });

  it('should map ORA-20xxx errors to BadRequestException', async () => {
    executeMock.mockRejectedValue({ errorNum: 20001, message: 'Invalid input' });

    await expect(service.getUserFromId(0)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
