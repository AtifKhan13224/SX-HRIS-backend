import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SeparationReason } from './separation-reason.entity';

@Entity('separation_reason_categories')
export class SeparationReasonCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== TENANT SCOPE ====================
  
  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  company_id: string;

  // ==================== CATEGORY IDENTITY ====================
  
  @Column({ type: 'varchar', length: 50, unique: true })
  category_code: string; // e.g., 'VOL', 'INVOL', 'MUTUAL', 'RETIRE', 'EOC', 'DIS'

  @Column({ type: 'varchar', length: 200 })
  category_name: string; // e.g., 'Voluntary Separation', 'Involuntary Termination'

  @Column({ type: 'text', nullable: true })
  description: string;

  // ==================== DISPLAY & ORDERING ====================
  
  @Column({ type: 'int', default: 0 })
  display_order: number; // Controls UI sorting

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon_name: string; // For UI visualization

  @Column({ type: 'varchar', length: 50, nullable: true })
  color_code: string; // Hex color for UI badges

  // ==================== CLASSIFICATION ====================
  
  @Column({ type: 'boolean', default: true })
  is_voluntary: boolean; // True for employee-initiated separations

  @Column({ type: 'boolean', default: false })
  is_involuntary: boolean; // True for employer-initiated terminations

  @Column({ type: 'boolean', default: false })
  is_mutual: boolean; // True for mutual agreement separations

  @Column({ type: 'boolean', default: false })
  is_retirement: boolean; // True for retirement categories

  @Column({ type: 'boolean', default: false })
  is_contract_end: boolean; // True for natural contract expiry

  @Column({ type: 'boolean', default: false })
  is_death: boolean; // True for death in service

  // ==================== LEGAL & COMPLIANCE ====================
  
  @Column({ type: 'boolean', default: false })
  requires_legal_review: boolean;

  @Column({ type: 'boolean', default: false })
  requires_government_reporting: boolean;

  @Column({ type: 'boolean', default: false })
  is_disciplinary: boolean; // Marks disciplinary-related separations

  @Column({ type: 'boolean', default: false })
  is_sensitive: boolean; // HR-only, restricted access

  // ==================== POLICY DEFAULTS ====================
  // (These are inherited by reasons unless overridden)
  
  @Column({ type: 'boolean', default: true })
  default_notice_required: boolean;

  @Column({ type: 'boolean', default: true })
  default_gratuity_eligible: boolean;

  @Column({ type: 'boolean', default: true })
  default_rehire_eligible: boolean;

  @Column({ type: 'boolean', default: true })
  default_final_settlement_eligible: boolean;

  // ==================== WORKFLOW TRIGGERS ====================
  
  @Column({ type: 'boolean', default: true })
  triggers_clearance_process: boolean;

  @Column({ type: 'boolean', default: true })
  triggers_asset_recovery: boolean;

  @Column({ type: 'boolean', default: true })
  triggers_access_deactivation: boolean;

  @Column({ type: 'boolean', default: false })
  triggers_legal_workflow: boolean;

  // ==================== ANALYTICS & REPORTING ====================
  
  @Column({ type: 'varchar', length: 50, nullable: true })
  attrition_type: string; // 'Regretted', 'Non-Regretted', 'Neutral'

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_indicator: string; // 'High', 'Medium', 'Low', 'None'

  @Column({ type: 'boolean', default: false })
  exclude_from_attrition_rate: boolean; // e.g., retirement, death

  // ==================== VISIBILITY & ACCESS ====================
  
  @Column({ type: 'boolean', default: false })
  hr_only: boolean; // Only visible to HR roles

  @Column({ type: 'boolean', default: true })
  manager_visible: boolean;

  @Column({ type: 'boolean', default: false })
  employee_self_service_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  mask_in_employee_view: boolean; // Hide true reason from employee

  // ==================== GOVERNANCE ====================
  
  @Column({ type: 'boolean', default: false })
  requires_dual_approval: boolean;

  @Column({ type: 'boolean', default: false })
  requires_mandatory_justification: boolean;

  @Column({ type: 'boolean', default: false })
  allow_manual_override: boolean;

  @Column({ type: 'boolean', default: true })
  audit_flag: boolean; // Track all usage in audit log

  // ==================== EFFECTIVE DATING ====================
  
  @Column({ type: 'date' })
  effective_from: string;

  @Column({ type: 'date', nullable: true })
  effective_to: string;

  // ==================== STATUS ====================
  
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_defined: boolean; // Cannot be deleted if true

  @Column({ type: 'varchar', length: 100, nullable: true })
  deactivation_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: string;

  @Column({ type: 'uuid', nullable: true })
  deactivated_by: string;

  // ==================== METADATA ====================
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Extended attributes

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ==================== RELATIONSHIPS ====================
  
  @OneToMany(() => SeparationReason, reason => reason.category)
  reasons: SeparationReason[];
}
