import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PartnerSupplierModule } from './partner-supplier/partner-supplier.module';
import { ProfessionalModule } from './professional/professional.module';
import { StoreModule } from './store/store.module';
import { RecommendedProfessionalModule } from './recommended-professional/recommended-professional.module';
import { LoveDecorationModule } from './love-decoration/love-decoration.module';
import { EventModule } from './event/event.module';
import { EventRegistrationModule } from './event-registration/event-registration.module';
import { ProductModule } from './product/product.module';
import { AddressModule } from './address/address.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { CommunityModule } from './community/community.module';
import { PostModule } from './post/post.module';
import { HashtagModule } from './hashtag/hashtag.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'default_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    PartnerSupplierModule,
    ProfessionalModule,
    AuthModule,
    UserModule,
    StoreModule,
    RecommendedProfessionalModule,
    LoveDecorationModule,
    EventModule,
    EventRegistrationModule,
    ProductModule,
    AddressModule,
    CommentModule,
    LikeModule,
    CommunityModule,
    PostModule,
    HashtagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
