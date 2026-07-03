import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MockVehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.mockVehicle.findMany({ orderBy: { year: 'asc' } }); }

  async findOne(id: number) {
    const v = await this.prisma.mockVehicle.findUnique({ where: { id } });
    if (!v) throw new NotFoundException();
    return v;
  }

  async create(data: any) { return this.prisma.mockVehicle.create({ data }); }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.mockVehicle.delete({ where: { id } });
  }
}
