import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    const store = await this.validateMyStore(userId, '');
    return this.prisma.product.create({
      data: {
        ...dto,
        storeId: store.id,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        store: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const store = await this.validateMyStore(userId, id);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        storeId: store.id,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.validateMyStore(userId, id);
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: 'Product deleted successfully' };
  }

  private async validateMyStore(userId: string, productId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnerSupplier: {
          include: { store: true },
        },
      },
    });

    const store = user?.partnerSupplier?.store;

    if (!store) {
      throw new NotFoundException('Loja não encontrada para esse usuário!');
    }

    if (productId != '') {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.storeId !== store.id) {
        throw new ForbiddenException('Produto não pertence à sua loja!');
      }
    }

    return store;
  }
}
