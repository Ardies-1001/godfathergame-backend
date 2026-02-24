import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

const parseBoolean = (value?: string) => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

@Injectable()
export class MailService {
  private createTransporter() {
    return nodemailer.createTransport({
      secure: parseBoolean(process.env.SMTP_SECURE),
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail({ to, subject, html }: SendMailInput) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) {
      throw new Error('SMTP_FROM ou SMTP_USER requis');
    }

    const transporter = this.createTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}
