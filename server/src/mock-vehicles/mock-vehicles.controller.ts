import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MockVehiclesService } from './mock-vehicles.service';
import { MockVehicle } from './mock-vehicle.entity';

@Controller('api/mock-vehicles')
export class MockVehiclesController {
  constructor(private readonly svc: MockVehiclesService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
  @Post() create(@Body() dto: Partial<MockVehicle>) { return this.svc.create(dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
