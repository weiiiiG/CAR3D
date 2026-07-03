import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('views')
export class View {
  @PrimaryColumn({ length: 50 })
  key: string;

  @Column({ length: 100 })
  label: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  spec: string;

  @Column({ length: 50, nullable: true })
  specCategory: string;

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

  @Column('jsonb', { nullable: true })
  chartConfig: any;

  @Column('int', { default: 0 })
  sortOrder: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
