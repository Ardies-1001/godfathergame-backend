import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: CreateContactDto) {
    // 1. Save to DB
    const contact = await this.prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    // 2. Send email to admin
    const adminEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (adminEmail) {
      await this.mailService.sendMail({
        to: adminEmail,
        subject: `[Contact] ${data.subject || 'Nouveau message'}`,
        html: `
          <h3>Nouveau message de ${data.name} (${data.email})</h3>
          <p>${data.message}</p>
        `,
      });
    }

    return contact;
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
