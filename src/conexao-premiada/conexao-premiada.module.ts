import { Module } from '@nestjs/common';
import { ConexaoPremiadaService } from './conexao-premiada.service';
import { ConexaoPremiadaController } from './conexao-premiada.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PointsModule } from 'src/points/points.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, PointsModule, AuthModule],
  controllers: [ConexaoPremiadaController],
  providers: [ConexaoPremiadaService],
  exports: [ConexaoPremiadaService],
})
export class ConexaoPremiadaModule {}
