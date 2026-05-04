import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // Payroll Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new payroll record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payroll records with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAll(@Query() query: PayrollQueryDto) {
    return this.payrollService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll record by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payroll record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() updatePayrollDto: UpdatePayrollDto) {
    return this.payrollService.update(id, updatePayrollDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payroll record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.payrollService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit payroll for approval' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  submitForApproval(@Param('id') id: string) {
    return this.payrollService.submitForApproval(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve payroll' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  approvePayroll(@Param('id') id: string, @Body() approvePayrollDto: ApprovePayrollDto) {
    return this.payrollService.approvePayroll(id, approvePayrollDto);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process payroll' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  processPayroll(@Param('id') id: string, @Body() processPayrollDto: ProcessPayrollDto) {
    return this.payrollService.processPayroll(id, processPayrollDto);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark payroll as paid' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Post('bulk-generate')
  @ApiOperation({ summary: 'Bulk generate payroll for multiple employees' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  bulkGeneratePayroll(
    @Body('employeeIds') employeeIds: string[],
    @Body('payPeriodStart') payPeriodStart: string,
    @Body('payPeriodEnd') payPeriodEnd: string,
    @Body('payrollDate') payrollDate: string,
  ) {
    return this.payrollService.bulkGeneratePayroll(
      employeeIds,
      payPeriodStart,
      payPeriodEnd,
      payrollDate,
    );
  }

  // Payroll Component Endpoints
  @Post('components')
  @ApiOperation({ summary: 'Create payroll component' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createComponent(@Body() createComponentDto: CreatePayrollComponentDto) {
    return this.payrollService.createComponent(createComponentDto);
  }

  @Get('components/all')
  @ApiOperation({ summary: 'Get all payroll components' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  findAllComponents() {
    return this.payrollService.findAllComponents();
  }

  @Get('components/:id')
  @ApiOperation({ summary: 'Get payroll component by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  findOneComponent(@Param('id') id: string) {
    return this.payrollService.findOneComponent(id);
  }

  @Patch('components/:id')
  @ApiOperation({ summary: 'Update payroll component' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateComponent(
    @Param('id') id: string,
    @Body() updateComponentDto: UpdatePayrollComponentDto,
  ) {
    return this.payrollService.updateComponent(id, updateComponentDto);
  }

  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete payroll component' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteComponent(@Param('id') id: string) {
    return this.payrollService.deleteComponent(id);
  }

  // Salary Structure Endpoints
  @Post('salary-structures')
  @ApiOperation({ summary: 'Create employee salary structure' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createSalaryStructure(@Body() createStructureDto: CreateEmployeeSalaryStructureDto) {
    return this.payrollService.createSalaryStructure(createStructureDto);
  }

  @Get('salary-structures/employee/:employeeId')
  @ApiOperation({ summary: 'Get salary structures for an employee' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  getEmployeeSalaryStructures(@Param('employeeId') employeeId: string) {
    return this.payrollService.getEmployeeSalaryStructures(employeeId);
  }

  @Get('salary-structures/employee/:employeeId/active')
  @ApiOperation({ summary: 'Get active salary structure for an employee' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  getActiveSalaryStructure(@Param('employeeId') employeeId: string) {
    return this.payrollService.getActiveSalaryStructure(employeeId);
  }

  @Patch('salary-structures/:id')
  @ApiOperation({ summary: 'Update salary structure' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateSalaryStructure(
    @Param('id') id: string,
    @Body() updateStructureDto: UpdateEmployeeSalaryStructureDto,
  ) {
    return this.payrollService.updateSalaryStructure(id, updateStructureDto);
  }
}
