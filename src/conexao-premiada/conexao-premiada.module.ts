import { Module } from '@nestjs/common';
import { ConexaoPremiadaService } from './conexao-premiada.service';
import { ConexaoPremiadaController } from './conexao-premiada.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [PrismaModule, PointsModule],
  controllers: [ConexaoPremiadaController],
  providers: [ConexaoPremiadaService],
  exports: [ConexaoPremiadaService],
})
export class ConexaoPremiadaModule {}
