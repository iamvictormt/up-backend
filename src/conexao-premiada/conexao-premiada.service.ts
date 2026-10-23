import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PointsService } from 'src/points/points.service';
import { RegisterSaleDto } from './dto/register-sale.dto';
import { RedeemCodeDto } from './dto/redeem-code.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { randomBytes } from 'crypto';

const LIMIT_REACHED = 'Limite de pontos para distribuição atingido por este parceiro.';
const SEARCH_PAGE_SIZE = 10;
// Lojista corrige em até 3 dias; depois só a administração
export const EDIT_WINDOW_DAYS = 3;

export function editableUntil(createdAt: Date) {
  return new Date(createdAt.getTime() + EDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

// 1 real = 1 ponto, arredondando para mais: qualquer centavo vira 1 ponto
export function pointsForValue(value: number) {
  return Math.ceil(value);
}

// Mostra só os dígitos do meio: ***.456.789-** / **.345.678/****-**
export function maskDocument(document?: string | null) {
  const d = (document || '').replace(/\D/g, '');
  if (d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  if (d.length === 14) return `**.${d.slice(2, 5)}.${d.slice(5, 8)}/****-**`;
  return null;
}

// O cadastro salva o CPF/CNPJ com máscara, mas registros antigos/admin podem estar sem
function documentVariants(digits: string) {
  if (digits.length === 11) {
    return [digits, digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')];
  }
  return [digits, digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')];
}

@Injectable()
export class ConexaoPremiadaService {
  constructor(
    private prisma: PrismaService,
    private pointsService: PointsService,
  ) {}

  private async getPartner(userId: string, message: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { partnerSupplier: true },
    });

    if (!user || !user.partnerSupplier) {
      throw new ForbiddenException(message);
    }

    return user.partnerSupplier;
  }

  // Incrementa e confere dentro da transação: o lock da linha evita que duas vendas simultâneas estourem o limite
  private async chargePartnerLimit(tx: Prisma.TransactionClient, partnerId: string, points: number, message = LIMIT_REACHED) {
    const partner = await tx.partnerSupplier.update({
      where: { id: partnerId },
      data: { currentPointsAwarded: { increment: points } },
    });

    if (partner.pointsLimit > 0 && partner.currentPointsAwarded > partner.pointsLimit) {
      throw new BadRequestException(message);
    }
  }

  async searchProfessionals(userId: string, query: string, page = 1) {
    await this.getPartner(userId, 'Apenas parceiros podem buscar profissionais.');

    const q = (query || '').trim();
    const digits = q.replace(/\D/g, '');
    const isDocument = !/[a-zA-ZÀ-ú]/.test(q) && (digits.length === 11 || digits.length === 14);

    let where: Prisma.ProfessionalWhereInput;
    if (isDocument) {
      where = { document: { in: documentVariants(digits) } };
    } else if (q.length >= 3) {
      where = { name: { contains: q, mode: 'insensitive' } };
    } else {
      return { items: [], hasMore: false };
    }

    const professionals = await this.prisma.professional.findMany({
      where: { ...where, user: { is: { isDeleted: false } } },
      select: {
        id: true,
        name: true,
        officeName: true,
        document: true,
        profession: { select: { name: true } },
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: (Math.max(page, 1) - 1) * SEARCH_PAGE_SIZE,
      take: SEARCH_PAGE_SIZE + 1,
    });

    // Nunca devolver o CPF inteiro para o lojista
    return {
      items: professionals.slice(0, SEARCH_PAGE_SIZE).map(({ document, profession, ...p }) => ({
        ...p,
        profession: profession?.name ?? null,
        document: maskDocument(document),
      })),
      hasMore: professionals.length > SEARCH_PAGE_SIZE,
    };
  }

  async registerSale(userId: string, dto: RegisterSaleDto) {
    const partner = await this.getPartner(userId, 'Apenas parceiros podem registrar vendas.');
    const points = pointsForValue(dto.value);
    const code = this.generateUniqueCode();
    const invoice = dto.invoice?.trim();
    if (!invoice) {
      throw new BadRequestException('Informe a nota fiscal.');
    }
    await this.assertInvoiceIsNew(this.prisma, partner.id, invoice);
    const saleData = {
      code,
      customerName: dto.customerName,
      value: dto.value,
      sellerName: dto.sellerName,
      invoice,
      points,
      partnerId: partner.id,
    };

    if (!dto.professionalId) {
      // Sem profissional identificado: fluxo de código, o limite é cobrado no resgate
      if (partner.pointsLimit > 0 && partner.currentPointsAwarded + points > partner.pointsLimit) {
        throw new BadRequestException(LIMIT_REACHED);
      }

      const sale = await this.prisma.physicalSale.create({ data: saleData });
      return {
        message: 'Venda registrada com sucesso.',
        code: sale.code,
        points: sale.points,
        credited: false,
      };
    }

    const professional = await this.prisma.professional.findFirst({
      where: { id: dto.professionalId, user: { is: { isDeleted: false } } },
      select: { id: true, name: true },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      await this.chargePartnerLimit(tx, partner.id, points);

      // Com profissional identificado, o cliente é sempre ele (não editável)
      const sale = await tx.physicalSale.create({
        data: { ...saleData, customerName: professional.name, professionalId: professional.id, redeemedAt: new Date() },
      });

      await this.pointsService.addPoints(professional.id, points, `CONEXAO_PREMIADA_${sale.code}`, tx);

      return {
        message: 'Venda registrada e pontos creditados.',
        code: sale.code,
        points,
        credited: true,
        professionalName: professional.name,
      };
    });
  }

  async redeemCode(userId: string, dto: RedeemCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user || !user.professional) {
      throw new ForbiddenException('Apenas profissionais podem resgatar códigos.');
    }

    const professional = user.professional;

    const sale = await this.prisma.physicalSale.findUnique({
      where: { code: dto.code },
    });

    if (!sale) {
      throw new NotFoundException('Código inválido.');
    }

    if (sale.cancelledAt) {
      throw new BadRequestException('Este código foi cancelado pela loja.');
    }

    if (sale.redeemedAt) {
      throw new BadRequestException('Este código já foi resgatado.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Condicional em redeemedAt: dois resgates simultâneos do mesmo código, só um passa
      const { count } = await tx.physicalSale.updateMany({
        where: { id: sale.id, redeemedAt: null, cancelledAt: null },
        data: {
          professionalId: professional.id,
          redeemedAt: new Date(),
        },
      });

      if (count === 0) {
        throw new BadRequestException('Este código já foi resgatado.');
      }

      await this.chargePartnerLimit(
        tx,
        sale.partnerId,
        sale.points,
        'O limite de pontos deste parceiro foi atingido. Entre em contato com a loja.',
      );

      await this.pointsService.addPoints(
        professional.id,
        sale.points,
        `CONEXAO_PREMIADA_${sale.code}`,
        tx,
      );

      return {
        message: 'Pontos resgatados com sucesso!',
        points: sale.points,
      };
    });
  }

  async updateSaleAsPartner(userId: string, saleId: string, dto: UpdateSaleDto) {
    const partner = await this.getPartner(userId, 'Apenas parceiros podem corrigir vendas.');
    return this.correctSale(saleId, dto, partner.id);
  }

  async cancelSaleAsPartner(userId: string, saleId: string) {
    const partner = await this.getPartner(userId, 'Apenas parceiros podem cancelar vendas.');
    return this.correctSale(saleId, null, partner.id);
  }

  // Admin: sem prazo e em qualquer loja
  updateSaleAsAdmin(saleId: string, dto: UpdateSaleDto) {
    return this.correctSale(saleId, dto);
  }

  cancelSaleAsAdmin(saleId: string) {
    return this.correctSale(saleId, null);
  }

  // dto null = cancelar. Acerta o saldo do profissional e o total distribuído da loja pela diferença de pontos.
  private async correctSale(saleId: string, dto: UpdateSaleDto | null, partnerId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.physicalSale.findUnique({ where: { id: saleId } });

      if (!sale || (partnerId && sale.partnerId !== partnerId)) {
        throw new NotFoundException('Venda não encontrada.');
      }

      if (sale.cancelledAt) {
        throw new BadRequestException('Esta venda já foi cancelada.');
      }

      if (partnerId && new Date() > editableUntil(sale.createdAt)) {
        throw new ForbiddenException(
          `O prazo de ${EDIT_WINDOW_DAYS} dias para correção terminou. Fale com a administração.`,
        );
      }

      if (dto?.invoice !== undefined) {
        if (!dto.invoice.trim()) {
          throw new BadRequestException('Informe a nota fiscal.');
        }
        await this.assertInvoiceIsNew(tx, sale.partnerId, dto.invoice, sale.id);
      }

      const newPoints = dto ? pointsForValue(dto.value ?? sale.value) : 0;
      const diff = newPoints - sale.points;

      // Só venda já creditada mexe em saldo; código pendente ainda não distribuiu nada
      if (sale.redeemedAt && sale.professionalId && diff !== 0) {
        const tag = dto ? 'AJUSTE' : 'ESTORNO';
        if (diff > 0) {
          await this.chargePartnerLimit(tx, sale.partnerId, diff);
          await this.pointsService.addPoints(sale.professionalId, diff, `CONEXAO_PREMIADA_${tag}_${sale.code}`, tx);
        } else {
          await this.pointsService.removePoints(sale.professionalId, -diff, `CONEXAO_PREMIADA_${tag}_${sale.code}`, tx);
          await tx.partnerSupplier.update({
            where: { id: sale.partnerId },
            data: { currentPointsAwarded: { decrement: -diff } },
          });
        }
      }

      const updated = await tx.physicalSale.update({
        where: { id: sale.id },
        data: dto
          ? {
              // Venda com profissional: o nome do cliente segue o do profissional e não muda na correção
              customerName: sale.professionalId ? sale.customerName : (dto.customerName ?? sale.customerName),
              value: dto.value ?? sale.value,
              sellerName: dto.sellerName ?? sale.sellerName,
              invoice: dto.invoice?.trim() ?? sale.invoice,
              points: newPoints,
            }
          : { cancelledAt: new Date() },
      });

      return {
        message: dto ? 'Venda corrigida.' : 'Venda cancelada.',
        points: updated.points,
        pointsDiff: sale.redeemedAt ? diff : 0,
      };
    });
  }

  // Mesma NF duas vezes na mesma loja = pontos em dobro. Ignora maiúsculas/espaços e vendas canceladas.
  // ponytail: checagem na aplicação, não índice único no banco, porque a base atual pode ter NFs repetidas ou vazias
  private async assertInvoiceIsNew(
    tx: Prisma.TransactionClient | PrismaService,
    partnerId: string,
    invoice: string,
    ignoreSaleId?: string,
  ) {
    const duplicate = await tx.physicalSale.findFirst({
      where: {
        partnerId,
        cancelledAt: null,
        invoice: { equals: invoice.trim(), mode: 'insensitive' },
        ...(ignoreSaleId ? { id: { not: ignoreSaleId } } : {}),
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new BadRequestException('Já existe uma venda com esta nota fiscal nesta loja.');
    }
  }

  private generateUniqueCode(): string {
    // Gera um código de 16 caracteres alfanuméricos
    return randomBytes(8).toString('hex').toUpperCase();
  }

  // Compras creditadas ao profissional (inclui canceladas, para ele entender estornos)
  async findMyPurchases(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { professional: { select: { id: true } } },
    });

    if (!user?.professional) {
      throw new ForbiddenException('Apenas profissionais podem ver suas compras.');
    }

    // Só o nome da loja: nada de dados do cliente final
    return this.prisma.physicalSale.findMany({
      where: { professionalId: user.professional.id, redeemedAt: { not: null } },
      select: {
        id: true,
        value: true,
        points: true,
        createdAt: true,
        redeemedAt: true,
        cancelledAt: true,
        partner: { select: { tradeName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPhysicalSales(userId: string) {
    const partner = await this.getPartner(userId, 'Apenas parceiros podem ver as vendas.');

    const sales = await this.prisma.physicalSale.findMany({
      where: {
        partnerId: partner.id,
      },
      include: {
        professional: { select: { name: true, document: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sales.map(({ professional, ...sale }) => ({
      ...sale,
      editableUntil: editableUntil(sale.createdAt),
      professional: professional
        ? { name: professional.name, document: maskDocument(professional.document) }
        : null,
    }));
  }
}
