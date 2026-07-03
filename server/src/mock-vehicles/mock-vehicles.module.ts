import { Module } from '@nestjs/common';
import { MockVehiclesController } from './mock-vehicles.controller';
import { MockVehiclesService } from './mock-vehicles.service';

@Module({
  controllers: [MockVehiclesController],
  providers: [MockVehiclesService],
})
export class MockVehiclesModule {}
