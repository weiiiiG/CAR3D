import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getConfig(key: string) {
    const c = await this.prisma.dashboardConfig.findUnique({ where: { key } });
    if (!c) throw new NotFoundException();
    return c;
  }

  async getAllConfigs() {
    const configs = await this.prisma.dashboardConfig.findMany();
    const result: any = {};
    for (const c of configs) result[c.key] = c.data;
    return result;
  }

  async upsertConfig(key: string, data: any) {
    return this.prisma.dashboardConfig.upsert({
      where: { key }, update: { data }, create: { key, data },
    });
  }
}
