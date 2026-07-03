import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ViewsModule } from './views/views.module';
import { MockVehiclesModule } from './mock-vehicles/mock-vehicles.module';
import { SeedService } from './seed/seed.service';
import { SeedController } from './seed/seed.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, ViewsModule, MockVehiclesModule],
  controllers: [SeedController, AdminController],
  providers: [SeedService],
})
export class AppModule {}
