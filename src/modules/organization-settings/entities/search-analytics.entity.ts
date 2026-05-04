import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('search_analytics')
@Index(['tenantId', 'createdAt'])
export class SearchAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  searchQuery: string;

  @Column({ type: 'int', default: 0 })
  resultsCount: number;

  @Column({ type: 'int', nullable: true })
  responseTime: number;

  @Column({ type: 'boolean', default: false })
  noResults: boolean;

  @Column({ type: 'varchar', nullable: true })
  selectedResult: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @Column({ type: 'varchar', nullable: true })
  searchEngine: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
