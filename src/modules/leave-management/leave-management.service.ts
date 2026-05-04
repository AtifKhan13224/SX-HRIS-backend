import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  LeaveRequest,
  LeaveBalance,
  LeavePolicy,
  LeaveStatus,
  LeaveType,
} from './entities/leave.entity';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveQueryDto,
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto,
  CreateLeavePolicyDto,
  UpdateLeavePolicyDto,
} from './dto/leave.dto';

@Injectable()
export class LeaveManagementService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepository: Repository<LeaveBalance>,
    @InjectRepository(LeavePolicy)
    private leavePolicyRepository: Repository<LeavePolicy>,
  ) {}

  // Leave Request Methods
  async createLeaveRequest(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const { employeeId, leaveType, startDate, endDate, totalDays } = createLeaveRequestDto;

    // Check if employee has sufficient balance
    const balance = await this.getEmployeeLeaveBalance(employeeId, leaveType);
    if (balance && balance.availableLeaves < totalDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // Check for overlapping leave requests
    const overlapping = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere('leave.startDate <= :endDate', { endDate })
      .andWhere('leave.endDate >= :startDate', { startDate })
      .getOne();

    if (overlapping) {
      throw new ConflictException('Leave request overlaps with existing request');
    }

    const leaveRequest = this.leaveRequestRepository.create(createLeaveRequestDto);
    const saved = await this.leaveRequestRepository.save(leaveRequest);

    // Update pending leaves in balance
    if (balance) {
      balance.pendingLeaves += totalDays;
      balance.availableLeaves -= totalDays;
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async findAllLeaveRequests(query: LeaveQueryDto): Promise<{
    data: LeaveRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { employeeId, status, leaveType, startDate, endDate, page = 1, limit = 10 } = query;

    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee');

    if (employeeId) {
      queryBuilder.andWhere('leave.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('leave.status = :status', { status });
    }

    if (leaveType) {
      queryBuilder.andWhere('leave.leaveType = :leaveType', { leaveType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('leave.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('leave.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOneLeaveRequest(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  async updateLeaveRequest(
    id: string,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOneLeaveRequest(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Can only update pending leave requests');
    }

    Object.assign(leaveRequest, updateLeaveRequestDto);
    return this.leaveRequestRepository.save(leaveRequest);
  }

  async approveLeaveRequest(id: string, approveLeaveDto: ApproveLeaveDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findOneLeaveRequest(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    leaveRequest.status = LeaveStatus.APPROVED;
    leaveRequest.approvedBy = approveLeaveDto.approvedBy;
    leaveRequest.approvedAt = new Date();
    leaveRequest.managerNotes = approveLeaveDto.managerNotes;

    const saved = await this.leaveRequestRepository.save(leaveRequest);

    // Update leave balance
    const balance = await this.getEmployeeLeaveBalance(
      leaveRequest.employeeId,
      leaveRequest.leaveType,
    );

    if (balance) {
      balance.pendingLeaves -= leaveRequest.totalDays;
      balance.usedLeaves += leaveRequest.totalDays;
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async rejectLeaveRequest(id: string, rejectLeaveDto: RejectLeaveDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findOneLeaveRequest(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    leaveRequest.status = LeaveStatus.REJECTED;
    leaveRequest.approvedBy = rejectLeaveDto.approvedBy;
    leaveRequest.rejectionReason = rejectLeaveDto.rejectionReason;
    leaveRequest.managerNotes = rejectLeaveDto.managerNotes;

    const saved = await this.leaveRequestRepository.save(leaveRequest);

    // Restore leave balance
    const balance = await this.getEmployeeLeaveBalance(
      leaveRequest.employeeId,
      leaveRequest.leaveType,
    );

    if (balance) {
      balance.pendingLeaves -= leaveRequest.totalDays;
      balance.availableLeaves += leaveRequest.totalDays;
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async cancelLeaveRequest(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOneLeaveRequest(id);

    if (leaveRequest.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Leave request is already cancelled');
    }

    const oldStatus = leaveRequest.status;
    leaveRequest.status = LeaveStatus.CANCELLED;

    const saved = await this.leaveRequestRepository.save(leaveRequest);

    // Restore leave balance
    const balance = await this.getEmployeeLeaveBalance(
      leaveRequest.employeeId,
      leaveRequest.leaveType,
    );

    if (balance) {
      if (oldStatus === LeaveStatus.PENDING) {
        balance.pendingLeaves -= leaveRequest.totalDays;
        balance.availableLeaves += leaveRequest.totalDays;
      } else if (oldStatus === LeaveStatus.APPROVED) {
        balance.usedLeaves -= leaveRequest.totalDays;
        balance.availableLeaves += leaveRequest.totalDays;
      }
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    const leaveRequest = await this.findOneLeaveRequest(id);
    await this.leaveRequestRepository.remove(leaveRequest);
  }

  // Leave Balance Methods
  async createLeaveBalance(createLeaveBalanceDto: CreateLeaveBalanceDto): Promise<LeaveBalance> {
    const { employeeId, leaveType, totalAllocated, carriedForward = 0 } = createLeaveBalanceDto;

    const availableLeaves = totalAllocated + carriedForward;

    const balance = this.leaveBalanceRepository.create({
      ...createLeaveBalanceDto,
      availableLeaves,
      usedLeaves: 0,
      pendingLeaves: 0,
    });

    return this.leaveBalanceRepository.save(balance);
  }

  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    return this.leaveBalanceRepository.find({
      where: { employeeId },
      relations: ['employee'],
    });
  }

  async getEmployeeLeaveBalance(employeeId: string, leaveType: LeaveType): Promise<LeaveBalance> {
    const currentYear = new Date().getFullYear();
    return this.leaveBalanceRepository.findOne({
      where: { employeeId, leaveType, year: currentYear },
    });
  }

  async updateLeaveBalance(
    id: string,
    updateLeaveBalanceDto: UpdateLeaveBalanceDto,
  ): Promise<LeaveBalance> {
    const balance = await this.leaveBalanceRepository.findOne({ where: { id } });

    if (!balance) {
      throw new NotFoundException(`Leave balance with ID ${id} not found`);
    }

    Object.assign(balance, updateLeaveBalanceDto);

    // Recalculate available leaves
    balance.availableLeaves =
      balance.totalAllocated +
      balance.carriedForward -
      balance.usedLeaves -
      balance.pendingLeaves;

    return this.leaveBalanceRepository.save(balance);
  }

  // Leave Policy Methods
  async createLeavePolicy(createLeavePolicyDto: CreateLeavePolicyDto): Promise<LeavePolicy> {
    const policy = this.leavePolicyRepository.create(createLeavePolicyDto);
    return this.leavePolicyRepository.save(policy);
  }

  async findAllLeavePolicies(): Promise<LeavePolicy[]> {
    return this.leavePolicyRepository.find({ where: { isActive: true } });
  }

  async findOneLeavePolicy(id: string): Promise<LeavePolicy> {
    const policy = await this.leavePolicyRepository.findOne({ where: { id } });

    if (!policy) {
      throw new NotFoundException(`Leave policy with ID ${id} not found`);
    }

    return policy;
  }

  async updateLeavePolicy(
    id: string,
    updateLeavePolicyDto: UpdateLeavePolicyDto,
  ): Promise<LeavePolicy> {
    const policy = await this.findOneLeavePolicy(id);
    Object.assign(policy, updateLeavePolicyDto);
    return this.leavePolicyRepository.save(policy);
  }

  async deleteLeavePolicy(id: string): Promise<void> {
    const policy = await this.findOneLeavePolicy(id);
    policy.isActive = false;
    await this.leavePolicyRepository.save(policy);
  }

  // Statistics
  async getLeaveStatistics(employeeId: string, year?: number): Promise<any> {
    const targetYear = year || new Date().getFullYear();

    const balances = await this.leaveBalanceRepository.find({
      where: { employeeId, year: targetYear },
    });

    const requests = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('EXTRACT(YEAR FROM leave.startDate) = :year', { year: targetYear })
      .getMany();

    return {
      year: targetYear,
      balances,
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === LeaveStatus.PENDING).length,
      approvedRequests: requests.filter((r) => r.status === LeaveStatus.APPROVED).length,
      rejectedRequests: requests.filter((r) => r.status === LeaveStatus.REJECTED).length,
      cancelledRequests: requests.filter((r) => r.status === LeaveStatus.CANCELLED).length,
    };
  }
}
