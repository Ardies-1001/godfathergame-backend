import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(data: CreateProductDto) {
    try {
      if (data.image) {
        data.image = await this.uploadService.uploadBase64(
          data.image,
          'products',
        );
      }

      if (data.gallery && data.gallery.length > 0) {
        data.gallery = await Promise.all(
          data.gallery.map((img) =>
            this.uploadService.uploadBase64(img, 'products'),
          ),
        );
      } else {
        data.gallery = [];
      }

      // Ensure videos is array
      data.videos = data.videos || [];

      // Create product with properly formatted data
      // We cast to any/unknown to handle the features JSON type compatibility
      return await this.prisma.product.create({
        data: {
          ...data,
          features: data.features
            ? (data.features as unknown as Prisma.InputJsonValue)
            : undefined,
        } as Prisma.ProductUncheckedCreateInput,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async findAll(categorySlug?: string) {
    if (categorySlug) {
      return this.prisma.product.findMany({
        where: {
          category: {
            slug: categorySlug,
          },
        },
        include: { category: true },
      });
    }
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: { category: true },
    });
    return product;
  }

  async update(id: string, data: UpdateProductDto) {
    if (data.image) {
      data.image = await this.uploadService.uploadBase64(
        data.image,
        'products',
      );
    }

    if (data.gallery && data.gallery.length > 0) {
      data.gallery = await Promise.all(
        data.gallery.map((img) =>
          this.uploadService.uploadBase64(img, 'products'),
        ),
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        features: data.features
          ? (data.features as unknown as Prisma.InputJsonValue)
          : undefined,
      } as Prisma.ProductUncheckedUpdateInput,
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (product) {
      if (product.image) {
        await this.uploadService.deleteFile(product.image);
      }

      if (product.gallery && product.gallery.length > 0) {
        await Promise.all(
          product.gallery.map((img) => this.uploadService.deleteFile(img)),
        );
      }
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
