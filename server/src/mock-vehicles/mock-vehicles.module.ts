import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockVehiclesController } from './mock-vehicles.controller';
import { MockVehiclesService } from './mock-vehicles.service';
import { MockVehicle } from './mock-vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MockVehicle])],
  controllers: [MockVehiclesController],
  providers: [MockVehiclesService],
  exports: [TypeOrmModule],
})
export class MockVehiclesModule {}
