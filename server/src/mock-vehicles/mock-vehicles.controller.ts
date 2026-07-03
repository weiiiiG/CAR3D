import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MockVehiclesService } from './mock-vehicles.service';

@Controller('api/mock-vehicles')
export class MockVehiclesController {
  constructor(private svc: MockVehiclesService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
  @Post() create(@Body() body: any) { return this.svc.create(body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
