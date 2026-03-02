import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserFromIdResponseDto } from './dto/get-user-from-id.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user details from user ID' })
  @ApiOkResponse({ type: UserFromIdResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user ID or user retrieval failure' })
  async getUserFromId(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserFromIdResponseDto> {
    return this.usersService.getUserFromId(userId);
  }
}
