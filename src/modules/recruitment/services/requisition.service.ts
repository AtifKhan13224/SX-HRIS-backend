import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../entities/requisition.entity';
import { CreateRequisitionDto, UpdateRequisitionDto } from '../dto/requisition.dto';

@Injectable()
export class RequisitionService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionRepository: Repository<Requisition>,
  ) {}

  async create(createDto: CreateRequisitionDto, createdBy?: string): Promise<Requisition> {
    const existing = await this.requisitionRepository.findOne({
      where: { requisitionNumber: createDto.requisitionNumber },
    });

    if (existing) {
      throw new BadRequestException(`Requisition with number ${createDto.requisitionNumber} already exists`);
    }

    const requisition = this.requisitionRepository.create({
      ...createDto,
      positionsFilled: 0,
      createdBy,
    });

    return await this.requisitionRepository.save(requisition);
  }

  async findAll(params?: any): Promise<Requisition[]> {
    const {
      groupCompanyId,
      departmentId,
      status,
      approvalStatus,
      isActive,
      search,
    } = params || {};

    const queryBuilder = this.requisitionRepository.createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.groupCompany', 'groupCompany')
      .leftJoinAndSelect('requisition.department', 'department')
      .leftJoinAndSelect('requisition.position', 'position');

    if (groupCompanyId) {
      queryBuilder.andWhere('requisition.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (departmentId) {
      queryBuilder.andWhere('requisition.departmentId = :departmentId', { departmentId });
    }

    if (status) {
      queryBuilder.andWhere('requisition.status = :status', { status });
    }

    if (approvalStatus) {
      queryBuilder.andWhere('requisition.approvalStatus = :approvalStatus', { approvalStatus });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('requisition.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(requisition.positionTitle ILIKE :search OR requisition.requisitionNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return await queryBuilder
      .orderBy('requisition.requestDate', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Requisition> {
    const requisition = await this.requisitionRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'department', 'position'],
    });

    if (!requisition) {
      throw new NotFoundException(`Requisition with ID ${id} not found`);
    }

    return requisition;
  }

  async update(id: string, updateDto: UpdateRequisitionDto, updatedBy?: string): Promise<Requisition> {
    const requisition = await this.findOne(id);

    Object.assign(requisition, { ...updateDto, updatedBy });
    return await this.requisitionRepository.save(requisition);
  }

  async remove(id: string): Promise<void> {
    const requisition = await this.findOne(id);
    await this.requisitionRepository.remove(requisition);
  }

  async approve(id: string, approverId: string, comments?: string): Promise<Requisition> {
    const requisition = await this.findOne(id);

    const approvalHistory = requisition.approvalHistory || [];
    approvalHistory.push({
      approverId,
      action: 'Approved',
      comments,
      timestamp: new Date(),
    });

    requisition.approvalStatus = 'Approved';
    requisition.approvalHistory = approvalHistory;
    requisition.finalApprovedBy = approverId;
    requisition.approvalCompletedDate = new Date();
    requisition.status = 'Approved';

    return await this.requisitionRepository.save(requisition);
  }

  async reject(id: string, approverId: string, reason: string): Promise<Requisition> {
    const requisition = await this.findOne(id);

    const approvalHistory = requisition.approvalHistory || [];
    approvalHistory.push({
      approverId,
      action: 'Rejected',
      comments: reason,
      timestamp: new Date(),
    });

    requisition.approvalStatus = 'Rejected';
    requisition.approvalHistory = approvalHistory;
    requisition.rejectionReason = reason;
    requisition.status = 'Rejected';

    return await this.requisitionRepository.save(requisition);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.requisitionRepository.createQueryBuilder('requisition');

    if (groupCompanyId) {
      queryBuilder.where('requisition.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const requisitions = await queryBuilder.getMany();

    const total = requisitions.length;
    const pending = requisitions.filter(r => r.approvalStatus === 'Pending').length;
    const approved = requisitions.filter(r => r.approvalStatus === 'Approved').length;
    const rejected = requisitions.filter(r => r.approvalStatus === 'Rejected').length;

    const totalPositions = requisitions.reduce((sum, r) => sum + (r.numberOfPositions || 0), 0);
    const totalFilled = requisitions.reduce((sum, r) => sum + (r.positionsFilled || 0), 0);

    return {
      total,
      pending,
      approved,
      rejected,
      totalPositions,
      totalFilled,
      totalRemaining: totalPositions - totalFilled,
      closed: requisitions.filter(r => r.isClosed).length,
    };
  }

  async generateRequisitionNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.requisitionRepository.count();
    const sequence = String(count + 1).padStart(5, '0');
    
    return `REQ-${year}${month}-${sequence}`;
  }
}
