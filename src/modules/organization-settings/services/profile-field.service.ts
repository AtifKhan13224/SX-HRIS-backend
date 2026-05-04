import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { ProfileFieldDefinition } from '../entities/profile-field-definition.entity';
import { ProfileFieldOption } from '../entities/profile-field-option.entity';
import {
  CreateProfileFieldDefinitionDto,
  UpdateProfileFieldDefinitionDto,
  CreateProfileFieldOptionDto,
  UpdateProfileFieldOptionDto,
  BulkUpdateOptionsOrderDto,
  QueryProfileFieldsDto,
} from '../dto/profile-field.dto';

@Injectable()
export class ProfileFieldService {
  constructor(
    @InjectRepository(ProfileFieldDefinition)
    private readonly fieldDefinitionRepo: Repository<ProfileFieldDefinition>,
    @InjectRepository(ProfileFieldOption)
    private readonly fieldOptionRepo: Repository<ProfileFieldOption>,
  ) {}

  // ============ Field Definitions ============

  async getAllFieldDefinitions(
    tenantId: string,
    query?: QueryProfileFieldsDto,
  ): Promise<ProfileFieldDefinition[]> {
    const where: any = { tenantId };

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const queryBuilder = this.fieldDefinitionRepo
      .createQueryBuilder('field')
      .where(where)
      .leftJoinAndSelect('field.options', 'options')
      .orderBy('field.sortOrder', 'ASC')
      .addOrderBy('field.fieldName', 'ASC')
      .addOrderBy('options.sortOrder', 'ASC');

    if (query?.search) {
      queryBuilder.andWhere(
        '(field.fieldName ILIKE :search OR field.fieldKey ILIKE :search OR field.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return await queryBuilder.getMany();
  }

  async getFieldDefinitionById(
    tenantId: string,
    id: string,
  ): Promise<ProfileFieldDefinition> {
    const field = await this.fieldDefinitionRepo.findOne({
      where: { id, tenantId },
      relations: ['options'],
      order: {
        options: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!field) {
      throw new NotFoundException(`Field definition with ID ${id} not found`);
    }

    return field;
  }

  async getFieldDefinitionByKey(
    tenantId: string,
    fieldKey: string,
  ): Promise<ProfileFieldDefinition> {
    const field = await this.fieldDefinitionRepo.findOne({
      where: { fieldKey, tenantId },
      relations: ['options'],
      order: {
        options: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!field) {
      throw new NotFoundException(`Field with key ${fieldKey} not found`);
    }

    return field;
  }

  async createFieldDefinition(
    tenantId: string,
    dto: CreateProfileFieldDefinitionDto,
    userId: string,
  ): Promise<ProfileFieldDefinition> {
    // Check if field key already exists
    const existing = await this.fieldDefinitionRepo.findOne({
      where: { tenantId, fieldKey: dto.fieldKey },
    });

    if (existing) {
      throw new BadRequestException(`Field with key ${dto.fieldKey} already exists`);
    }

    const field = this.fieldDefinitionRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.fieldDefinitionRepo.save(field);
  }

  async updateFieldDefinition(
    tenantId: string,
    id: string,
    dto: UpdateProfileFieldDefinitionDto,
    userId: string,
  ): Promise<ProfileFieldDefinition> {
    const field = await this.getFieldDefinitionById(tenantId, id);

    if (field.isSystem && dto.isActive === false) {
      throw new BadRequestException('System fields cannot be deactivated');
    }

    Object.assign(field, {
      ...dto,
      updatedBy: userId,
    });

    return await this.fieldDefinitionRepo.save(field);
  }

  async deleteFieldDefinition(tenantId: string, id: string): Promise<void> {
    const field = await this.getFieldDefinitionById(tenantId, id);

    if (field.isSystem) {
      throw new BadRequestException('System fields cannot be deleted');
    }

    // Check if field has options
    const optionsCount = await this.fieldOptionRepo.count({
      where: { fieldDefinitionId: id, tenantId },
    });

    if (optionsCount > 0) {
      throw new BadRequestException(
        `Cannot delete field with ${optionsCount} options. Delete options first.`,
      );
    }

    await this.fieldDefinitionRepo.remove(field);
  }

  // ============ Field Options ============

  async getFieldOptions(
    tenantId: string,
    fieldDefinitionId: string,
  ): Promise<ProfileFieldOption[]> {
    return await this.fieldOptionRepo.find({
      where: { tenantId, fieldDefinitionId },
      order: { sortOrder: 'ASC', displayValue: 'ASC' },
    });
  }

  async getOptionById(tenantId: string, id: string): Promise<ProfileFieldOption> {
    const option = await this.fieldOptionRepo.findOne({
      where: { id, tenantId },
      relations: ['fieldDefinition'],
    });

    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }

    return option;
  }

  async createFieldOption(
    tenantId: string,
    dto: CreateProfileFieldOptionDto,
    userId: string,
  ): Promise<ProfileFieldOption> {
    // Verify field definition exists
    const fieldDef = await this.getFieldDefinitionById(tenantId, dto.fieldDefinitionId);

    // Check if code already exists for this field
    const existing = await this.fieldOptionRepo.findOne({
      where: {
        tenantId,
        fieldDefinitionId: dto.fieldDefinitionId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Option with code ${dto.code} already exists for this field`,
      );
    }

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.fieldOptionRepo.update(
        { tenantId, fieldDefinitionId: dto.fieldDefinitionId, isDefault: true },
        { isDefault: false },
      );
    }

    const option = this.fieldOptionRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.fieldOptionRepo.save(option);
  }

  async updateFieldOption(
    tenantId: string,
    id: string,
    dto: UpdateProfileFieldOptionDto,
    userId: string,
  ): Promise<ProfileFieldOption> {
    const option = await this.getOptionById(tenantId, id);

    if (option.isSystem && dto.isEnabled === false) {
      throw new BadRequestException('System options cannot be disabled');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.fieldOptionRepo.update(
        {
          tenantId,
          fieldDefinitionId: option.fieldDefinitionId,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    Object.assign(option, {
      ...dto,
      updatedBy: userId,
    });

    return await this.fieldOptionRepo.save(option);
  }

  async deleteFieldOption(tenantId: string, id: string): Promise<void> {
    const option = await this.getOptionById(tenantId, id);

    if (option.isSystem) {
      throw new BadRequestException('System options cannot be deleted');
    }

    await this.fieldOptionRepo.remove(option);
  }

  async bulkUpdateOptionsOrder(
    tenantId: string,
    fieldDefinitionId: string,
    dto: BulkUpdateOptionsOrderDto,
  ): Promise<ProfileFieldOption[]> {
    // Verify field exists
    await this.getFieldDefinitionById(tenantId, fieldDefinitionId);

    // Update all options
    for (const item of dto.options) {
      await this.fieldOptionRepo.update(
        { id: item.id, tenantId, fieldDefinitionId },
        { sortOrder: item.sortOrder },
      );
    }

    return await this.getFieldOptions(tenantId, fieldDefinitionId);
  }

  async duplicateFieldOption(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<ProfileFieldOption> {
    const original = await this.getOptionById(tenantId, id);

    const duplicate = this.fieldOptionRepo.create({
      ...original,
      id: undefined,
      code: `${original.code}_copy`,
      displayValue: `${original.displayValue} (Copy)`,
      isDefault: false,
      isSystem: false,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.fieldOptionRepo.save(duplicate);
  }

  // ============ Seeding System Fields ============

  async seedSystemFields(tenantId: string): Promise<void> {
    const systemFields = [
      {
        fieldKey: 'gender',
        fieldName: 'Gender',
        fieldType: 'single_select',
        category: 'personal',
        isSystem: true,
        options: [
          { code: 'male', displayValue: 'Male', alias: 'M' },
          { code: 'female', displayValue: 'Female', alias: 'F' },
          { code: 'non_binary', displayValue: 'Non-Binary', alias: 'NB' },
          { code: 'prefer_not_to_say', displayValue: 'Prefer not to say', alias: 'N/A' },
        ],
      },
      {
        fieldKey: 'marital_status',
        fieldName: 'Marital Status',
        fieldType: 'single_select',
        category: 'personal',
        isSystem: true,
        options: [
          { code: 'single', displayValue: 'Single', alias: 'S' },
          { code: 'married', displayValue: 'Married', alias: 'M' },
          { code: 'divorced', displayValue: 'Divorced', alias: 'D' },
          { code: 'widowed', displayValue: 'Widowed', alias: 'W' },
          { code: 'separated', displayValue: 'Separated', alias: 'SEP' },
        ],
      },
      {
        fieldKey: 'employment_type',
        fieldName: 'Employment Type',
        fieldType: 'single_select',
        category: 'employment',
        isSystem: true,
        isRequired: true,
        options: [
          { code: 'permanent', displayValue: 'Permanent', alias: 'PERM', isDefault: true },
          { code: 'contract', displayValue: 'Contract', alias: 'CONT' },
          { code: 'temporary', displayValue: 'Temporary', alias: 'TEMP' },
          { code: 'intern', displayValue: 'Intern', alias: 'INT' },
          { code: 'part_time', displayValue: 'Part-Time', alias: 'PT' },
          { code: 'consultant', displayValue: 'Consultant', alias: 'CONS' },
        ],
      },
    ];

    for (const fieldData of systemFields) {
      const existing = await this.fieldDefinitionRepo.findOne({
        where: { tenantId, fieldKey: fieldData.fieldKey },
      });

      if (!existing) {
        const { options, ...fieldDefData } = fieldData;
        const fieldDef = this.fieldDefinitionRepo.create({
          ...fieldDefData,
          tenantId,
          createdBy: 'system',
          updatedBy: 'system',
        });
        const savedField = await this.fieldDefinitionRepo.save(fieldDef);

        // Create options
        for (const [index, optionData] of options.entries()) {
          const option = this.fieldOptionRepo.create({
            ...optionData,
            tenantId,
            fieldDefinitionId: savedField.id,
            sortOrder: index,
            isSystem: true,
            applicableFor: { employeeTypes: ['all'] },
            createdBy: 'system',
            updatedBy: 'system',
          });
          await this.fieldOptionRepo.save(option);
        }
      }
    }
  }
}
