import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'jwt.token.to.logout' })
  @IsString()
  @MinLength(1)
  token: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
