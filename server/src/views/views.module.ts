import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';
import { View } from './entities/view.entity';
import { ViewOverride } from './entities/view-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([View, ViewOverride])],
  controllers: [ViewsController],
  providers: [ViewsService],
  exports: [ViewsService, TypeOrmModule],
})
export class ViewsModule {}
