import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OracleModule } from '../providers/oracle.module';

@Module({
  imports: [OracleModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
