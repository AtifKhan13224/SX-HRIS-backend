import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(search?: string, isActive?: boolean, parentDivisionId?: string, parentDepartmentId?: string): Promise<Department[]> {
    const queryBuilder = this.departmentRepository.createQueryBuilder('department');
    
    queryBuilder.leftJoinAndSelect('department.parentDivision', 'parentDivision');
    queryBuilder.leftJoinAndSelect('department.parentDepartment', 'parentDepartment');
    queryBuilder.leftJoinAndSelect('department.topDepartment', 'topDepartment');
    queryBuilder.leftJoinAndSelect('department.subDepartments', 'subDepartments');

    if (search) {
      queryBuilder.andWhere(
        '(department.departmentName LIKE :search OR department.departmentCode LIKE :search OR department.departmentEmail LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('department.isActive = :isActive', { isActive });
    }

    if (parentDivisionId) {
      queryBuilder.andWhere('department.parentDivisionId = :parentDivisionId', { parentDivisionId });
    }

    if (parentDepartmentId) {
      queryBuilder.andWhere('department.parentDepartmentId = :parentDepartmentId', { parentDepartmentId });
    }

    queryBuilder.orderBy('department.departmentName', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parentDivision', 'parentDepartment', 'topDepartment', 'subDepartments'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check for duplicate department code
    const existingDepartment = await this.departmentRepository.findOne({
      where: { departmentCode: createDepartmentDto.departmentCode },
    });

    if (existingDepartment) {
      throw new ConflictException(`Department with code ${createDepartmentDto.departmentCode} already exists`);
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Check for duplicate department code if it's being updated
    if (updateDepartmentDto.departmentCode && updateDepartmentDto.departmentCode !== department.departmentCode) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { departmentCode: updateDepartmentDto.departmentCode },
      });

      if (existingDepartment) {
        throw new ConflictException(`Department with code ${updateDepartmentDto.departmentCode} already exists`);
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }

  async toggleStatus(id: string): Promise<Department> {
    const department = await this.findOne(id);
    department.isActive = !department.isActive;
    return this.departmentRepository.save(department);
  }

  async toggleAutoNumbering(id: string): Promise<Department> {
    const department = await this.findOne(id);
    department.autoNumbering = !department.autoNumbering;
    return this.departmentRepository.save(department);
  }

  async toggleCore(id: string): Promise<Department> {
    const department = await this.findOne(id);
    department.isCore = !department.isCore;
    return this.departmentRepository.save(department);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    core: number;
    totalEmployees: number;
    totalSubDepartments: number;
    byType: { type: string; count: number }[];
    byFunctionalArea: { area: string; count: number }[];
  }> {
    const [departments, total] = await this.departmentRepository.findAndCount();

    const active = departments.filter(d => d.isActive).length;
    const inactive = departments.filter(d => !d.isActive).length;
    const core = departments.filter(d => d.isCore).length;
    const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);
    const totalSubDepartments = departments.reduce((sum, d) => sum + (d.subDepartmentCount || 0), 0);

    // Group by type
    const typeMap = new Map<string, number>();
    departments.forEach(d => {
      if (d.departmentType) {
        typeMap.set(d.departmentType, (typeMap.get(d.departmentType) || 0) + 1);
      }
    });
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

    // Group by functional area
    const areaMap = new Map<string, number>();
    departments.forEach(d => {
      if (d.functionalArea) {
        areaMap.set(d.functionalArea, (areaMap.get(d.functionalArea) || 0) + 1);
      }
    });
    const byFunctionalArea = Array.from(areaMap.entries()).map(([area, count]) => ({ area, count }));

    return {
      total,
      active,
      inactive,
      core,
      totalEmployees,
      totalSubDepartments,
      byType,
      byFunctionalArea,
    };
  }

  async getByParentDivision(parentDivisionId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { parentDivisionId },
      relations: ['parentDepartment', 'topDepartment', 'subDepartments'],
      order: { departmentName: 'ASC' },
    });
  }

  async getByParentDepartment(parentDepartmentId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { parentDepartmentId },
      relations: ['parentDivision', 'topDepartment', 'subDepartments'],
      order: { departmentName: 'ASC' },
    });
  }

  async getTopLevelDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { parentDepartmentId: IsNull() },
      relations: ['parentDivision', 'subDepartments'],
      order: { departmentName: 'ASC' },
    });
  }

  async getDepartmentHierarchy(id: string): Promise<Department[]> {
    const department = await this.findOne(id);
    const hierarchy: Department[] = [department];

    let current = department;
    while (current.parentDepartmentId) {
      const parent = await this.findOne(current.parentDepartmentId);
      hierarchy.unshift(parent);
      current = parent;
    }

    return hierarchy;
  }
}
