import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'Fid' })
  @IsString()
  firstname: string;

  @ApiProperty({ example: 'Zulu' })
  @IsString()
  lastname: string;

  @ApiProperty({ example: 'fidzulu' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], default: 'USER' })
  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';
}

export class RegisterUserResponseDto {
  @ApiProperty({ example: 101 })
  userId: number;
}
