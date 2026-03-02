# Providers

## Oracle DB Provider

This folder contains the Oracle database provider used by the NestJS app.

- Provider file: `oracle.provider.ts`
- Injection token: `ORACLE_DB`
- Returned type: `oracledb.Pool`

## Environment Variables

Set these in your `.env` file before starting the server:

```env
ORACLE_USER=your_oracle_user
ORACLE_PASSWORD=your_oracle_password
ORACLE_CONNECTION_STRING=host:port/service_name
```

Example connection string:

```env
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1
```

## Registration

The provider is registered in `src/app.module.ts`:

```ts
providers: [AppService, oracleProvider]
```

## Usage in a Service

Inject the provider token and use the Oracle pool:

```ts
import { Inject, Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ORACLE_DB } from './providers/oracle.provider';

@Injectable()
export class ExampleService {
  constructor(
    @Inject(ORACLE_DB)
    private readonly pool: oracledb.Pool,
  ) {}

  async pingDatabase() {
    const connection = await this.pool.getConnection();
    try {
      const result = await connection.execute('SELECT 1 AS ok FROM dual');
      return result.rows;
    } finally {
      await connection.close();
    }
  }
}
```

## Notes

- `oracledb` package must be installed (already added in `package.json`).
- Oracle client/runtime requirements still apply depending on your environment.
