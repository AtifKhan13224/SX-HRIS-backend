import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee ID already exists
    const existingEmployee = await this.employeesRepository.findOne({
      where: { employeeId: createEmployeeDto.employeeId },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee ID already exists');
    }

    // Check if email already exists
    const emailExists = await this.employeesRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    const employee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
  ): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const query = this.employeesRepository.createQueryBuilder('employee');

    if (search) {
      query.where(
        'employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.email LIKE :search OR employee.employeeId LIKE :search',
        { search: `%${search}%` },
      );
    }

    // Add category filtering
    if (category && category !== 'ALL') {
      if (search) {
        query.andWhere('employee.employeeCategory = :category', { category });
      } else {
        query.where('employee.employeeCategory = :category', { category });
      }
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('employee.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { employeeId },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee;
  }

  async findByEmail(email: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { email },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }

    return employee;
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { department },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check if new email already exists (if email is being updated)
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const emailExists = await this.employeesRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<{ message: string }> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
    return { message: 'Employee deleted successfully' };
  }

  async getEmployeesByStatus(status: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { employmentStatus: status as any },
    });
  }

  async getTotalEmployees(): Promise<number> {
    return this.employeesRepository.count();
  }

  async getActiveEmployees(): Promise<number> {
    return this.employeesRepository.count({
      where: { isActive: true },
    });
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .where(
        'employee.firstName LIKE :query OR employee.lastName LIKE :query OR employee.email LIKE :query OR employee.employeeId LIKE :query',
        { query: `%${query}%` },
      )
      .orderBy('employee.createdAt', 'DESC')
      .take(20)
      .getMany();
  }
}
