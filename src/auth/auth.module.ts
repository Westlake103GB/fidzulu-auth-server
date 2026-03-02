import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OracleModule } from '../providers/oracle.module';

@Module({
  imports: [OracleModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
