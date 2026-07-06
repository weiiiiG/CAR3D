import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    const { password, ...result } = user;
    return result;
  }

  async create(dto: { username: string; password: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new ConflictException('用户名已存在');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { username: dto.username, password: hashed, role: dto.role || 'admin' },
    });
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  async update(id: number, dto: { username?: string; role?: string }) {
    const user = await this.findOne(id);
    const data: any = {};
    if (dto.username) data.username = dto.username;
    if (dto.role) data.role = dto.role;
    const updated = await this.prisma.user.update({ where: { id }, data });
    const { password, ...result } = updated;
    return result;
  }
}
