import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'existing.jwt.token' })
  @IsString()
  @MinLength(1)
  oldToken: string;

  @ApiPropertyOptional({
    example: 'REFRESH',
    description: 'Optional session event type for the refreshed token.',
  })
  @IsOptional()
  @IsString()
  event?: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'new.jwt.token,USER_ID=101' })
  token: string;
}
