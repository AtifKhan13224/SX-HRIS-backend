import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { GroupCompany } from './entities/group-company.entity';
import { CreateGroupCompanyDto } from './dto/create-group-company.dto';
import { UpdateGroupCompanyDto } from './dto/update-group-company.dto';

@Injectable()
export class GroupCompanyService {
  constructor(
    @InjectRepository(GroupCompany)
    private groupCompanyRepository: Repository<GroupCompany>,
  ) {}

  async findAll(search?: string, isActive?: boolean): Promise<GroupCompany[]> {
    const queryBuilder = this.groupCompanyRepository.createQueryBuilder('groupCompany');

    if (search) {
      queryBuilder.where(
        '(groupCompany.groupCompanyName LIKE :search OR groupCompany.groupCompanyCode LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('groupCompany.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy('groupCompany.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<GroupCompany> {
    const groupCompany = await this.groupCompanyRepository.findOne({
      where: { id },
    });

    if (!groupCompany) {
      throw new NotFoundException(`Group Company with ID ${id} not found`);
    }

    return groupCompany;
  }

  async create(createDto: CreateGroupCompanyDto): Promise<GroupCompany> {
    // Check if code already exists
    const existing = await this.groupCompanyRepository.findOne({
      where: { groupCompanyCode: createDto.groupCompanyCode },
    });

    if (existing) {
      throw new ConflictException(
        `Group Company with code ${createDto.groupCompanyCode} already exists`
      );
    }

    const groupCompany = this.groupCompanyRepository.create(createDto);
    return this.groupCompanyRepository.save(groupCompany);
  }

  async update(id: string, updateDto: UpdateGroupCompanyDto): Promise<GroupCompany> {
    const groupCompany = await this.findOne(id);

    // Check if code is being changed and if new code already exists
    if (updateDto.groupCompanyCode && updateDto.groupCompanyCode !== groupCompany.groupCompanyCode) {
      const existing = await this.groupCompanyRepository.findOne({
        where: { groupCompanyCode: updateDto.groupCompanyCode },
      });

      if (existing) {
        throw new ConflictException(
          `Group Company with code ${updateDto.groupCompanyCode} already exists`
        );
      }
    }

    Object.assign(groupCompany, updateDto);
    return this.groupCompanyRepository.save(groupCompany);
  }

  async remove(id: string): Promise<void> {
    const groupCompany = await this.findOne(id);
    await this.groupCompanyRepository.remove(groupCompany);
  }

  async toggleStatus(id: string): Promise<GroupCompany> {
    const groupCompany = await this.findOne(id);
    groupCompany.isActive = !groupCompany.isActive;
    return this.groupCompanyRepository.save(groupCompany);
  }

  async uploadLogo(id: string, logoData: string): Promise<GroupCompany> {
    const groupCompany = await this.findOne(id);
    groupCompany.companyLogo = logoData;
    return this.groupCompanyRepository.save(groupCompany);
  }

  async deleteLogo(id: string): Promise<GroupCompany> {
    const groupCompany = await this.findOne(id);
    groupCompany.companyLogo = null;
    return this.groupCompanyRepository.save(groupCompany);
  }

  async getStats(): Promise<any> {
    const total = await this.groupCompanyRepository.count();
    const active = await this.groupCompanyRepository.count({ where: { isActive: true } });
    const inactive = await this.groupCompanyRepository.count({ where: { isActive: false } });

    return {
      total,
      active,
      inactive,
    };
  }
}
