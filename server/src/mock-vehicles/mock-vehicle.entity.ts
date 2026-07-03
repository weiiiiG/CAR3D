import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mock_vehicles')
export class MockVehicle {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ length: 50, nullable: true }) brand: string;
  @Column({ length: 50, nullable: true }) country: string;
  @Column('int', { nullable: true }) year: number;
  @Column('int', { nullable: true }) hp: number;
  @Column('int', { nullable: true }) torque: number;
  @Column('float', { nullable: true }) acceleration: number;
  @Column('int', { nullable: true }) topSpeed: number;
  @Column('int', { nullable: true }) weight: number;
  @Column({ length: 100, nullable: true }) engine: string;
  @Column('float', { nullable: true }) price: number;
  @Column('float', { nullable: true }) fuelConsumption: number;
  @Column('float', { nullable: true }) displacement: number;
  @Column({ length: 50, nullable: true }) driveType: string;
  @Column({ length: 50, nullable: true }) category: string;
}
