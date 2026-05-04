import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessUnit } from './entities/business-unit.entity';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';

@Injectable()
export class BusinessUnitService {
  constructor(
    @InjectRepository(BusinessUnit)
    private businessUnitRepository: Repository<BusinessUnit>,
  ) {}

  async findAll(search?: string, isActive?: boolean, parentGroupCompanyId?: string): Promise<BusinessUnit[]> {
    const queryBuilder = this.businessUnitRepository
      .createQueryBuilder('businessUnit')
      .leftJoinAndSelect('businessUnit.parentGroupCompany', 'parentGroupCompany');

    if (search) {
      queryBuilder.where(
        '(businessUnit.businessUnitName LIKE :search OR businessUnit.businessUnitCode LIKE :search OR businessUnit.costCenter LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('businessUnit.isActive = :isActive', { isActive });
    }

    if (parentGroupCompanyId) {
      queryBuilder.andWhere('businessUnit.parentGroupCompanyId = :parentGroupCompanyId', { parentGroupCompanyId });
    }

    queryBuilder.orderBy('businessUnit.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<BusinessUnit> {
    const businessUnit = await this.businessUnitRepository.findOne({
      where: { id },
      relations: ['parentGroupCompany'],
    });

    if (!businessUnit) {
      throw new NotFoundException(`Business Unit with ID ${id} not found`);
    }

    return businessUnit;
  }

  async create(createDto: CreateBusinessUnitDto): Promise<BusinessUnit> {
    // Check if code already exists
    const existing = await this.businessUnitRepository.findOne({
      where: { businessUnitCode: createDto.businessUnitCode },
    });

    if (existing) {
      throw new ConflictException(
        `Business Unit with code ${createDto.businessUnitCode} already exists`
      );
    }

    const businessUnit = this.businessUnitRepository.create(createDto);
    return this.businessUnitRepository.save(businessUnit);
  }

  async update(id: string, updateDto: UpdateBusinessUnitDto): Promise<BusinessUnit> {
    const businessUnit = await this.findOne(id);

    // Check if code is being changed and if new code already exists
    if (updateDto.businessUnitCode && updateDto.businessUnitCode !== businessUnit.businessUnitCode) {
      const existing = await this.businessUnitRepository.findOne({
        where: { businessUnitCode: updateDto.businessUnitCode },
      });

      if (existing) {
        throw new ConflictException(
          `Business Unit with code ${updateDto.businessUnitCode} already exists`
        );
      }
    }

    Object.assign(businessUnit, updateDto);
    return this.businessUnitRepository.save(businessUnit);
  }

  async remove(id: string): Promise<void> {
    const businessUnit = await this.findOne(id);
    await this.businessUnitRepository.remove(businessUnit);
  }

  async toggleStatus(id: string): Promise<BusinessUnit> {
    const businessUnit = await this.findOne(id);
    businessUnit.isActive = !businessUnit.isActive;
    return this.businessUnitRepository.save(businessUnit);
  }

  async toggleAutoNumbering(id: string): Promise<BusinessUnit> {
    const businessUnit = await this.findOne(id);
    businessUnit.autoNumbering = !businessUnit.autoNumbering;
    return this.businessUnitRepository.save(businessUnit);
  }

  async getStats(): Promise<any> {
    const total = await this.businessUnitRepository.count();
    const active = await this.businessUnitRepository.count({ where: { isActive: true } });
    const inactive = await this.businessUnitRepository.count({ where: { isActive: false } });
    const headquarters = await this.businessUnitRepository.count({ where: { isHeadquarters: true } });

    // Get employee count sum
    const result = await this.businessUnitRepository
      .createQueryBuilder('businessUnit')
      .select('SUM(businessUnit.employeeCount)', 'totalEmployees')
      .getRawOne();

    return {
      total,
      active,
      inactive,
      headquarters,
      totalEmployees: parseInt(result?.totalEmployees) || 0,
    };
  }

  async getByParentCompany(parentGroupCompanyId: string): Promise<BusinessUnit[]> {
    return this.businessUnitRepository.find({
      where: { parentGroupCompanyId },
      relations: ['parentGroupCompany'],
      order: { businessUnitName: 'ASC' },
    });
  }
}
