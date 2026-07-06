import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get() getAll() { return this.svc.getAllConfigs(); }
  @Get(':key') getOne(@Param('key') key: string) { return this.svc.getConfig(key); }
  @Put(':key') update(@Param('key') key: string, @Body() body: any) { return this.svc.upsertConfig(key, body.data); }
}
