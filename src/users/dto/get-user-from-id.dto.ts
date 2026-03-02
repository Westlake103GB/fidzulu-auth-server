import { ApiProperty } from '@nestjs/swagger';

export class UserFromIdResponseDto {
  @ApiProperty({ example: 101 })
  userId: number;

  @ApiProperty({ example: 'Fid' })
  firstname: string;

  @ApiProperty({ example: 'Zulu' })
  lastname: string;

  @ApiProperty({ example: 'fidzulu' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'USER' })
  role: string;
}
