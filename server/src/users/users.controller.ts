import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Post() create(@Body() dto: { username: string; password: string; role?: string }) {
    return this.svc.create(dto);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: { username?: string; role?: string }) {
    return this.svc.update(+id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
