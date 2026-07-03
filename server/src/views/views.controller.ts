import { Controller, Get, Param, Patch, Body, Put, Delete, Post } from '@nestjs/common';
import { ViewsService } from './views.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

@Controller('api')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get('views')
  findAll() { return this.viewsService.findAllWithOverrides(); }

  @Get('views/:key')
  findOne(@Param('key') key: string) { return this.viewsService.findOne(key); }

  @Post('views')
  create(@Body() dto: CreateViewDto) { return this.viewsService.create(dto); }

  @Patch('views/:key')
  update(@Param('key') key: string, @Body() dto: UpdateViewDto) {
    return this.viewsService.update(key, dto);
  }

  @Delete('views/:key')
  remove(@Param('key') key: string) { return this.viewsService.remove(key); }

  @Get('overrides')
  getOverrides() { return this.viewsService.getOverrides(); }

  @Put('overrides/:viewKey')
  setOverride(@Param('viewKey') viewKey: string, @Body() dto: CreateOverrideDto) {
    return this.viewsService.setOverride({ ...dto, viewKey });
  }

  @Delete('overrides/:viewKey')
  deleteOverride(@Param('viewKey') viewKey: string) {
    return this.viewsService.deleteOverride(viewKey);
  }
}
