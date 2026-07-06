import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ViewsModule } from './views/views.module';
import { MockVehiclesModule } from './mock-vehicles/mock-vehicles.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeedService } from './seed/seed.service';
import { SeedController } from './seed/seed.controller';

@Module({
  imports: [PrismaModule, ViewsModule, MockVehiclesModule, DashboardModule, AuthModule, UsersModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class AppModule {}
