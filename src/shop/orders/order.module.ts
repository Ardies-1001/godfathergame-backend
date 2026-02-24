import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../auth/admin.guard';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, AdminGuard],
})
export class OrderModule {}
