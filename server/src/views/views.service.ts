import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.view.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(key: string) {
    const view = await this.prisma.view.findUnique({ where: { key } });
    if (!view) throw new NotFoundException(`View "${key}" not found`);
    return view;
  }

  async create(dto: CreateViewDto) {
    const existing = await this.prisma.view.findUnique({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`View "${dto.key}" already exists`);
    return this.prisma.view.create({ data: dto as any });
  }

  async update(key: string, dto: UpdateViewDto) {
    await this.findOne(key);
    return this.prisma.view.update({ where: { key }, data: dto as any });
  }

  async remove(key: string) {
    await this.findOne(key);
    await this.prisma.viewOverride.deleteMany({ where: { viewKey: key } });
    await this.prisma.view.delete({ where: { key } });
  }

  async findAllWithOverrides() {
    const views = await this.prisma.view.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { overrides: true },
    });
    return views.map(v => {
      const ov = v.overrides?.[0] || null;
      return {
        ...v,
        overridePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : null,
        overrideTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : null,
        effectivePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : { x: v.posX, y: v.posY, z: v.posZ },
        effectiveTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : { x: v.targetX, y: v.targetY, z: v.targetZ },
      };
    });
  }

  async getOverrides() {
    return this.prisma.viewOverride.findMany();
  }

  async setOverride(dto: CreateOverrideDto) {
    await this.findOne(dto.viewKey);
    return this.prisma.viewOverride.upsert({
      where: { viewKey: dto.viewKey },
      update: { posX: dto.posX, posY: dto.posY, posZ: dto.posZ, targetX: dto.targetX, targetY: dto.targetY, targetZ: dto.targetZ },
      create: dto as any,
    });
  }

  async deleteOverride(viewKey: string) {
    await this.prisma.viewOverride.deleteMany({ where: { viewKey } });
  }
}
