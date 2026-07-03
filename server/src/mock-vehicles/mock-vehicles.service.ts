import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockVehicle } from './mock-vehicle.entity';

@Injectable()
export class MockVehiclesService {
  constructor(
    @InjectRepository(MockVehicle)
    private repo: Repository<MockVehicle>,
  ) {}

  findAll(): Promise<MockVehicle[]> {
    return this.repo.find({ order: { year: 'DESC', hp: 'DESC' } });
  }

  findOne(id: number): Promise<MockVehicle> {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: Partial<MockVehicle>): Promise<MockVehicle> {
    return this.repo.save(dto);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
