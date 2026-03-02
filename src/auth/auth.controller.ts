import { Body, Controller, Ip, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { LogoutDto, MessageResponseDto } from './dto/logout.dto';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/refresh-token.dto';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
import { VerifyTokenDto, VerifyTokenResponseDto } from './dto/verify-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: RegisterUserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation or registration failure' })
  async register(
    @Body() payload: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    const userId = await this.authService.register(payload);
    return { userId };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid login payload/credentials' })
  async login(
    @Body() payload: LoginDto,
    @Ip() ipAddress: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(payload.email, payload.password, ipAddress);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh an existing token' })
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token invalid or expired' })
  async refreshToken(
    @Body() payload: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const token = await this.authService.refreshToken(payload);
    return { token };
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify token validity and return session details' })
  @ApiOkResponse({ type: VerifyTokenResponseDto })
  async verifyToken(
    @Body() payload: VerifyTokenDto,
  ): Promise<VerifyTokenResponseDto> {
    return this.authService.verifyToken(payload.token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate token session' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token invalid or expired' })
  async logout(@Body() payload: LogoutDto): Promise<MessageResponseDto> {
    await this.authService.logout(payload.token);
    return { message: 'Logout successful' };
  }
}
