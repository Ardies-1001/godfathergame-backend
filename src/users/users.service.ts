import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createDto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const passwordHash = await bcrypt.hash(createDto.password, 12);
    return this.prisma.user.create({
      data: {
        email: createDto.email.toLowerCase(),
        name: createDto.name,
        passwordHash,
        role: createDto.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; role?: 'ADMIN' | 'USER'; email?: string },
  ) {
    if (data.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email déjà pris');
      }
      data.email = data.email.toLowerCase();
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
