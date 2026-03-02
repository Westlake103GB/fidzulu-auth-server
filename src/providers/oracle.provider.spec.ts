import * as oracledb from 'oracledb';
import { ORACLE_DB, oracleProvider } from './oracle.provider';

jest.mock('oracledb', () => ({
  createPool: jest.fn(),
}));

describe('oracleProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      DB_USER: 'test_user',
      DB_PASS: 'test_password',
      DB_CONNECT_STRING: 'localhost:1521/XEPDB1',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should expose the expected injection token', () => {
    expect(ORACLE_DB).toBe('ORACLE_DB');
    expect(oracleProvider.provide).toBe(ORACLE_DB);
  });

  it('should create and return an Oracle pool using env config', async () => {
    const mockPool = { getConnection: jest.fn() } as unknown as oracledb.Pool;
    (oracledb.createPool as jest.Mock).mockResolvedValue(mockPool);

    const createdPool = await (
      oracleProvider.useFactory as () => Promise<oracledb.Pool>
    )();

    expect(oracledb.createPool).toHaveBeenCalledWith({
      user: 'test_user',
      password: 'test_password',
      connectString: 'localhost:1521/XEPDB1',
    });
    expect(createdPool).toBe(mockPool);
  });

  it('should propagate createPool errors', async () => {
    const expectedError = new Error('pool creation failed');
    (oracledb.createPool as jest.Mock).mockRejectedValue(expectedError);

    await expect(
      (oracleProvider.useFactory as () => Promise<oracledb.Pool>)(),
    ).rejects.toThrow('pool creation failed');
  });
});
