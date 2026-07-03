import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewsModule } from './views/views.module';
import { SeedService } from './seed/seed.service';
import { SeedController } from './seed/seed.controller';
import { AdminController } from './admin.controller';
import { View } from './views/entities/view.entity';
import { ViewOverride } from './views/entities/view-override.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'car3d_admin',
      entities: [View, ViewOverride],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([View, ViewOverride]),
    ViewsModule,
  ],
  controllers: [SeedController, AdminController],
  providers: [SeedService],
})
export class AppModule {}
