import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
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
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
