import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Optional for guest login when password is also omitted.',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length === 0 ? undefined : trimmedValue;
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Password1',
    description: 'Optional for guest login when email is also omitted.',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length === 0 ? undefined : trimmedValue;
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
