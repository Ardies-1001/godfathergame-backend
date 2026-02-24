import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { passwordResetTemplate } from '../mail/templates/password-reset';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const getAppName = () => process.env.APP_NAME || 'GodFatherGame';

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || 'http://localhost:3000';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  private async signAccessToken(userId: string) {
    const payload = { sub: userId };
    return this.jwt.signAsync(payload);
  }

  async register(input: { email: string; password: string; name?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = await this.signAccessToken(user.id);
    return { user, accessToken };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const accessToken = await this.signAccessToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (!user) {
      return { ok: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${getFrontendUrl()}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
    const html = passwordResetTemplate({
      appName: getAppName(),
      resetUrl,
      supportEmail: process.env.SMTP_FROM || process.env.SMTP_USER,
    });

    await this.mail.sendMail({
      to: user.email,
      subject: `[${getAppName()}] Réinitialisation de mot de passe`,
      html,
    });

    return { ok: true };
  }

  async resetPassword(input: { token: string; password: string }) {
    const tokenHash = sha256(input.token);
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordTokenExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    return { ok: true };
  }
}
