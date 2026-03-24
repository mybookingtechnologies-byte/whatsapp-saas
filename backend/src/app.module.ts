import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    OrganizationModule,
  ],
})
export class AppModule {}
