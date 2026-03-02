import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Optional for guest login when password is also omitted.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Passw0rd!',
    description: 'Optional for guest login when email is also omitted.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  password?: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....' })
  token: string;

  @ApiProperty({ example: 101 })
  userId: number;

  @ApiProperty({ example: 'USER' })
  role: string;
}
