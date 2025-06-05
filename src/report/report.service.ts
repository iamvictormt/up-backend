import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReportDto, userId: string) {
    return this.prisma.report.create({
      data: {
        reason: data.reason,
        description: data.description,
        user: { connect: { id: userId } },
        targetId: data.targetId,
        targetType: data.targetType,
      },
    });
  }
}
