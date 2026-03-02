import { Module } from '@nestjs/common';
import { oracleProvider } from './oracle.provider';

@Module({
  providers: [oracleProvider],
  exports: [oracleProvider],
})
export class OracleModule {}
