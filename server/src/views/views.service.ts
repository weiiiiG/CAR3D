import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { View } from './entities/view.entity';
import { ViewOverride } from './entities/view-override.entity';
import { CreateViewDto } from './dto/create-view.dto';
import { CreateOverrideDto } from './dto/create-override.dto';
import { UpdateViewDto } from './dto/update-view.dto';

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(View)
    private viewsRepo: Repository<View>,
    @InjectRepository(ViewOverride)
    private overridesRepo: Repository<ViewOverride>,
  ) {}

  async findAll(): Promise<View[]> {
    return this.viewsRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(key: string): Promise<View> {
    const view = await this.viewsRepo.findOne({ where: { key } });
    if (!view) throw new NotFoundException(`View "${key}" not found`);
    return view;
  }

  async create(dto: CreateViewDto): Promise<View> {
    const existing = await this.viewsRepo.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`View "${dto.key}" already exists`);
    return this.viewsRepo.save(dto);
  }

  async update(key: string, dto: UpdateViewDto): Promise<View> {
    const view = await this.findOne(key);
    Object.assign(view, dto);
    view.updatedAt = new Date();
    return this.viewsRepo.save(view);
  }

  async remove(key: string): Promise<void> {
    const view = await this.findOne(key);
    await this.overridesRepo.delete({ viewKey: key });
    await this.viewsRepo.remove(view);
  }

  /** 返回合并后的视角列表（内置 + 覆盖） */
  async findAllWithOverrides(): Promise<any[]> {
    const views = await this.findAll();
    const overrides = await this.overridesRepo.find();
    const overrideMap = new Map(overrides.map(o => [o.viewKey, o]));

    return views.map(v => {
      const ov = overrideMap.get(v.key);
      return {
        ...v,
        overridePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : null,
        overrideTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : null,
        effectivePos: ov ? { x: ov.posX, y: ov.posY, z: ov.posZ } : { x: v.posX, y: v.posY, z: v.posZ },
        effectiveTarget: ov ? { x: ov.targetX, y: ov.targetY, z: ov.targetZ } : { x: v.targetX, y: v.targetY, z: v.targetZ },
      };
    });
  }

  async getOverrides(): Promise<ViewOverride[]> {
    return this.overridesRepo.find();
  }

  async setOverride(dto: CreateOverrideDto): Promise<ViewOverride> {
    await this.findOne(dto.viewKey);
    const existing = await this.overridesRepo.findOne({ where: { viewKey: dto.viewKey } });
    if (existing) {
      Object.assign(existing, {
        posX: dto.posX, posY: dto.posY, posZ: dto.posZ,
        targetX: dto.targetX, targetY: dto.targetY, targetZ: dto.targetZ,
        updatedAt: new Date(),
      });
      return this.overridesRepo.save(existing);
    }
    return this.overridesRepo.save(dto);
  }

  async deleteOverride(viewKey: string): Promise<void> {
    const ov = await this.overridesRepo.findOne({ where: { viewKey } });
    if (ov) await this.overridesRepo.remove(ov);
  }
}
