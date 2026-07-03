import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('view_overrides')
export class ViewOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  viewKey: string;

  @Column('double precision')
  posX: number;

  @Column('double precision')
  posY: number;

  @Column('double precision')
  posZ: number;

  @Column('double precision')
  targetX: number;

  @Column('double precision')
  targetY: number;

  @Column('double precision')
  targetZ: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
