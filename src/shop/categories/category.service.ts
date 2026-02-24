import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(data: CreateCategoryDto) {
    if (data.image) {
      data.image = await this.uploadService.uploadBase64(
        data.image,
        'categories',
      );
    }

    return this.prisma.category.create({ data });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { products: true },
    });
  }

  async update(slug: string, data: UpdateCategoryDto) {
    if (data.image) {
      data.image = await this.uploadService.uploadBase64(
        data.image,
        'categories',
      );
    }
    return this.prisma.category.update({
      where: { slug },
      data,
    });
  }

  async remove(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (category && category.image) {
      await this.uploadService.deleteFile(category.image);
    }

    return this.prisma.category.delete({
      where: { slug },
    });
  }
}
