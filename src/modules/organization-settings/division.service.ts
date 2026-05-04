import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Division } from './entities/division.entity';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionService {
  constructor(
    @InjectRepository(Division)
    private divisionRepository: Repository<Division>,
  ) {}

  async findAll(search?: string, isActive?: boolean, parentBusinessUnitId?: string): Promise<Division[]> {
    const query = this.divisionRepository.createQueryBuilder('division')
      .leftJoinAndSelect('division.parentBusinessUnit', 'businessUnit');

    if (search) {
      query.andWhere(
        '(division.divisionName LIKE :search OR division.divisionCode LIKE :search OR division.costCenter LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined && isActive !== null) {
      query.andWhere('division.isActive = :isActive', { isActive });
    }

    if (parentBusinessUnitId) {
      query.andWhere('division.parentBusinessUnitId = :parentBusinessUnitId', { parentBusinessUnitId });
    }

    query.orderBy('division.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Division> {
    const division = await this.divisionRepository.findOne({
      where: { id },
      relations: ['parentBusinessUnit'],
    });

    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }

    return division;
  }

  async create(createDivisionDto: CreateDivisionDto): Promise<Division> {
    // Check for duplicate division code
    const existing = await this.divisionRepository.findOne({
      where: { divisionCode: createDivisionDto.divisionCode },
    });

    if (existing) {
      throw new ConflictException(`Division with code ${createDivisionDto.divisionCode} already exists`);
    }

    const division = this.divisionRepository.create(createDivisionDto);
    return await this.divisionRepository.save(division);
  }

  async update(id: string, updateDivisionDto: UpdateDivisionDto): Promise<Division> {
    const division = await this.findOne(id);

    // Check for duplicate division code if it's being updated
    if (updateDivisionDto.divisionCode && updateDivisionDto.divisionCode !== division.divisionCode) {
      const existing = await this.divisionRepository.findOne({
        where: { divisionCode: updateDivisionDto.divisionCode },
      });

      if (existing) {
        throw new ConflictException(`Division with code ${updateDivisionDto.divisionCode} already exists`);
      }
    }

    Object.assign(division, updateDivisionDto);
    return await this.divisionRepository.save(division);
  }

  async remove(id: string): Promise<void> {
    const division = await this.findOne(id);
    await this.divisionRepository.remove(division);
  }

  async toggleStatus(id: string): Promise<Division> {
    const division = await this.findOne(id);
    division.isActive = !division.isActive;
    return await this.divisionRepository.save(division);
  }

  async toggleAutoNumbering(id: string): Promise<Division> {
    const division = await this.findOne(id);
    division.autoNumbering = !division.autoNumbering;
    return await this.divisionRepository.save(division);
  }

  async toggleStrategic(id: string): Promise<Division> {
    const division = await this.findOne(id);
    division.isStrategic = !division.isStrategic;
    return await this.divisionRepository.save(division);
  }

  async getStats(): Promise<any> {
    const total = await this.divisionRepository.count();
    const active = await this.divisionRepository.count({ where: { isActive: true } });
    const inactive = await this.divisionRepository.count({ where: { isActive: false } });
    const strategic = await this.divisionRepository.count({ where: { isStrategic: true } });

    const divisions = await this.divisionRepository.find();
    const totalEmployees = divisions.reduce((sum, div) => sum + (div.employeeCount || 0), 0);
    const totalDepartments = divisions.reduce((sum, div) => sum + (div.departmentCount || 0), 0);

    return {
      total,
      active,
      inactive,
      strategic,
      totalEmployees,
      totalDepartments,
    };
  }

  async getByParentBusinessUnit(parentBusinessUnitId: string): Promise<Division[]> {
    return await this.divisionRepository.find({
      where: { parentBusinessUnitId },
      relations: ['parentBusinessUnit'],
      order: { createdAt: 'DESC' },
    });
  }
}
