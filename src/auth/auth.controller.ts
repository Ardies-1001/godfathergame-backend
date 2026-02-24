import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Inscription' })
  @ApiCreatedResponse({
    schema: {
      example: {
        user: {
          id: 'ckx...',
          email: 'admin@godfathergame.com',
          name: 'Administrateur',
          role: 'USER',
          createdAt: '2026-02-22T16:00:00.000Z',
          updatedAt: '2026-02-22T16:00:00.000Z',
        },
        accessToken: 'eyJhbGciOi...',
      },
    },
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @ApiOperation({ summary: 'Connexion' })
  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 'ckx...',
          email: 'admin@godfathergame.com',
          name: 'Administrateur',
          role: 'USER',
          createdAt: '2026-02-22T16:00:00.000Z',
          updatedAt: '2026-02-22T16:00:00.000Z',
        },
        accessToken: 'eyJhbGciOi...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Identifiants invalides',
        error: 'Unauthorized',
      },
    },
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @ApiOperation({ summary: 'Profil (user courant)' })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        id: 'ckx...',
        email: 'admin@godfathergame.com',
        name: 'Administrateur',
        role: 'USER',
        createdAt: '2026-02-22T16:00:00.000Z',
        updatedAt: '2026-02-22T16:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: Request & { user?: { userId: string } }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.auth.getMe(userId);
  }

  @ApiOperation({ summary: 'Demander un lien de réinitialisation' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
}
