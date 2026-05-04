import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Payroll,
  PayrollComponent,
  EmployeeSalaryStructure,
  PayrollStatus,
} from './entities/payroll.entity';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  ProcessPayrollDto,
  ApprovePayrollDto,
  PayrollQueryDto,
  CreatePayrollComponentDto,
  UpdatePayrollComponentDto,
  CreateEmployeeSalaryStructureDto,
  UpdateEmployeeSalaryStructureDto,
} from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(PayrollComponent)
    private payrollComponentRepository: Repository<PayrollComponent>,
    @InjectRepository(EmployeeSalaryStructure)
    private salaryStructureRepository: Repository<EmployeeSalaryStructure>,
  ) {}

  // Payroll Methods
  async create(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    const { basicSalary, allowances = 0, bonuses = 0, overtimePay = 0, deductions = 0, taxAmount = 0 } = createPayrollDto;

    const grossSalary = basicSalary + allowances + bonuses + overtimePay;
    const netSalary = grossSalary - deductions - taxAmount;

    const payroll = this.payrollRepository.create({
      ...createPayrollDto,
      grossSalary,
      netSalary,
    });

    return this.payrollRepository.save(payroll);
  }

  async findAll(query: PayrollQueryDto): Promise<{
    data: Payroll[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { employeeId, status, startDate, endDate, page = 1, limit = 10 } = query;

    const queryBuilder = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.employee', 'employee');

    if (employeeId) {
      queryBuilder.andWhere('payroll.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('payroll.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('payroll.payrollDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('payroll.payrollDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async update(id: string, updatePayrollDto: UpdatePayrollDto): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot update paid payroll');
    }

    Object.assign(payroll, updatePayrollDto);

    // Recalculate gross and net salary
    const {
      basicSalary = payroll.basicSalary,
      allowances = payroll.allowances,
      bonuses = payroll.bonuses,
      overtimePay = payroll.overtimePay,
      deductions = payroll.deductions,
      taxAmount = payroll.taxAmount,
    } = updatePayrollDto;

    payroll.grossSalary = Number(basicSalary) + Number(allowances) + Number(bonuses) + Number(overtimePay);
    payroll.netSalary = payroll.grossSalary - Number(deductions) - Number(taxAmount);

    return this.payrollRepository.save(payroll);
  }

  async remove(id: string): Promise<void> {
    const payroll = await this.findOne(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot delete paid payroll');
    }

    await this.payrollRepository.remove(payroll);
  }

  async approvePayroll(id: string, approvePayrollDto: ApprovePayrollDto): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Payroll is not pending approval');
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedBy = approvePayrollDto.approvedBy;
    payroll.approvedAt = new Date();

    return this.payrollRepository.save(payroll);
  }

  async processPayroll(id: string, processPayrollDto: ProcessPayrollDto): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Payroll must be approved before processing');
    }

    payroll.status = PayrollStatus.PROCESSED;
    payroll.processedBy = processPayrollDto.processedBy;
    payroll.processedAt = new Date();
    payroll.paymentReference = processPayrollDto.paymentReference;

    return this.payrollRepository.save(payroll);
  }

  async markAsPaid(id: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.PROCESSED) {
      throw new BadRequestException('Payroll must be processed before marking as paid');
    }

    payroll.status = PayrollStatus.PAID;
    return this.payrollRepository.save(payroll);
  }

  async submitForApproval(id: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException('Only draft payrolls can be submitted for approval');
    }

    payroll.status = PayrollStatus.PENDING_APPROVAL;
    return this.payrollRepository.save(payroll);
  }

  async bulkGeneratePayroll(
    employeeIds: string[],
    payPeriodStart: string,
    payPeriodEnd: string,
    payrollDate: string,
  ): Promise<Payroll[]> {
    const payrolls: Payroll[] = [];

    for (const employeeId of employeeIds) {
      // Get active salary structure
      const salaryStructure = await this.salaryStructureRepository
        .createQueryBuilder('structure')
        .where('structure.employeeId = :employeeId', { employeeId })
        .andWhere('structure.isActive = :isActive', { isActive: true })
        .andWhere('structure.effectiveFrom <= :date', { date: payrollDate })
        .andWhere('(structure.effectiveTo IS NULL OR structure.effectiveTo >= :date)', {
          date: payrollDate,
        })
        .getOne();

      if (salaryStructure) {
        const payroll = await this.create({
          employeeId,
          payPeriodStart,
          payPeriodEnd,
          payrollDate,
          basicSalary: Number(salaryStructure.basicSalary),
          allowances: 0,
          bonuses: 0,
          overtimePay: 0,
          deductions: 0,
          taxAmount: 0,
        });

        payrolls.push(payroll);
      }
    }

    return payrolls;
  }

  // Payroll Component Methods
  async createComponent(createComponentDto: CreatePayrollComponentDto): Promise<PayrollComponent> {
    const component = this.payrollComponentRepository.create(createComponentDto);
    return this.payrollComponentRepository.save(component);
  }

  async findAllComponents(): Promise<PayrollComponent[]> {
    return this.payrollComponentRepository.find({ where: { isActive: true } });
  }

  async findOneComponent(id: string): Promise<PayrollComponent> {
    const component = await this.payrollComponentRepository.findOne({ where: { id } });

    if (!component) {
      throw new NotFoundException(`Payroll component with ID ${id} not found`);
    }

    return component;
  }

  async updateComponent(
    id: string,
    updateComponentDto: UpdatePayrollComponentDto,
  ): Promise<PayrollComponent> {
    const component = await this.findOneComponent(id);
    Object.assign(component, updateComponentDto);
    return this.payrollComponentRepository.save(component);
  }

  async deleteComponent(id: string): Promise<void> {
    const component = await this.findOneComponent(id);
    component.isActive = false;
    await this.payrollComponentRepository.save(component);
  }

  // Salary Structure Methods
  async createSalaryStructure(
    createStructureDto: CreateEmployeeSalaryStructureDto,
  ): Promise<EmployeeSalaryStructure> {
    // Deactivate existing active structures
    await this.salaryStructureRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: false, effectiveTo: new Date(createStructureDto.effectiveFrom) })
      .where('employeeId = :employeeId', { employeeId: createStructureDto.employeeId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();

    const structure = this.salaryStructureRepository.create(createStructureDto);
    return this.salaryStructureRepository.save(structure);
  }

  async getEmployeeSalaryStructures(employeeId: string): Promise<EmployeeSalaryStructure[]> {
    return this.salaryStructureRepository.find({
      where: { employeeId },
      order: { effectiveFrom: 'DESC' },
    });
  }

  async getActiveSalaryStructure(employeeId: string): Promise<EmployeeSalaryStructure> {
    const structure = await this.salaryStructureRepository
      .createQueryBuilder('structure')
      .where('structure.employeeId = :employeeId', { employeeId })
      .andWhere('structure.isActive = :isActive', { isActive: true })
      .getOne();

    if (!structure) {
      throw new NotFoundException(
        `No active salary structure found for employee ${employeeId}`,
      );
    }

    return structure;
  }

  async updateSalaryStructure(
    id: string,
    updateStructureDto: UpdateEmployeeSalaryStructureDto,
  ): Promise<EmployeeSalaryStructure> {
    const structure = await this.salaryStructureRepository.findOne({ where: { id } });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    Object.assign(structure, updateStructureDto);
    return this.salaryStructureRepository.save(structure);
  }
}
