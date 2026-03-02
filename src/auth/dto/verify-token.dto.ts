import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ example: 'jwt.token.to.verify' })
  @IsString()
  @MinLength(1)
  token: string;
}

export class VerifyTokenResponseDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: 'LOGIN', nullable: true })
  event: string | null;

  @ApiProperty({ example: 101, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 'USER', nullable: true })
  role: string | null;

  @ApiProperty({ example: 1740902400, nullable: true })
  sessionExpireDate: number | null;
}
