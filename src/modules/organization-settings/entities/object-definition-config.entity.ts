import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('object_definition_configs')
@Index(['objectType'], { unique: true })
export class ObjectDefinitionConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  objectType: string; // 'company-profile', 'group-company', etc.

  @Column({ type: 'json' })
  definition: any; // Full ObjectDefinition structure

  @Column({ type: 'varchar', length: 50, default: '1.0' })
  version: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
