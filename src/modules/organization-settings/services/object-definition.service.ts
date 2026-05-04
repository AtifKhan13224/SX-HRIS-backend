import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectDefinitionConfig } from '../entities/object-definition-config.entity';
import { SaveObjectDefinitionDto, UpdateFieldStatusDto } from '../dto/object-definition.dto';

@Injectable()
export class ObjectDefinitionService {
  constructor(
    @InjectRepository(ObjectDefinitionConfig)
    private readonly objectDefinitionRepository: Repository<ObjectDefinitionConfig>,
  ) {}

  /**
   * Get object definition configuration by object type
   */
  async getObjectDefinition(objectType: string): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    return {
      version: config.version,
      objectType: config.objectType,
      lastModified: config.updatedAt.toISOString(),
      modifiedBy: config.modifiedBy,
      definition: config.definition,
    };
  }

  /**
   * Get all configured object types
   */
  async getConfiguredObjects(): Promise<string[]> {
    const configs = await this.objectDefinitionRepository.find({
      select: ['objectType'],
    });
    return configs.map(c => c.objectType);
  }

  /**
   * Save or update object definition configuration
   */
  async saveObjectDefinition(dto: SaveObjectDefinitionDto): Promise<any> {
    let config = await this.objectDefinitionRepository.findOne({
      where: { objectType: dto.objectType },
    });

    if (config) {
      // Update existing
      config.definition = dto.definition;
      config.modifiedBy = dto.modifiedBy || 'system';
    } else {
      // Create new
      config = this.objectDefinitionRepository.create({
        objectType: dto.objectType,
        definition: dto.definition,
        version: '1.0',
        modifiedBy: dto.modifiedBy || 'system',
      });
    }

    const saved = await this.objectDefinitionRepository.save(config);

    return {
      success: true,
      objectType: saved.objectType,
      version: saved.version,
      lastModified: saved.updatedAt.toISOString(),
    };
  }

  /**
   * Update field visibility status
   */
  async updateFieldVisibility(
    objectType: string,
    fieldId: string,
    visible: boolean,
  ): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    const definition = config.definition;
    let fieldFound = false;

    // Navigate through portlets > blocks > fields to find and update the field
    for (const portlet of definition.portlets || []) {
      for (const block of portlet.blocks || []) {
        const field = block.fields?.find((f: any) => f.id === fieldId);
        if (field) {
          field.visible = visible;
          fieldFound = true;
          break;
        }
      }
      if (fieldFound) break;
    }

    if (!fieldFound) {
      throw new NotFoundException(`Field ${fieldId} not found in ${objectType}`);
    }

    config.definition = definition;
    await this.objectDefinitionRepository.save(config);

    return { success: true, fieldId, visible };
  }

  /**
   * Update field enabled status
   */
  async updateFieldEnabled(
    objectType: string,
    fieldId: string,
    enabled: boolean,
  ): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    const definition = config.definition;
    let fieldFound = false;

    // Navigate through portlets > blocks > fields to find and update the field
    for (const portlet of definition.portlets || []) {
      for (const block of portlet.blocks || []) {
        const field = block.fields?.find((f: any) => f.id === fieldId);
        if (field) {
          field.enabled = enabled;
          // If disabled, also hide the field
          if (!enabled) {
            field.visible = false;
          }
          fieldFound = true;
          break;
        }
      }
      if (fieldFound) break;
    }

    if (!fieldFound) {
      throw new NotFoundException(`Field ${fieldId} not found in ${objectType}`);
    }

    config.definition = definition;
    await this.objectDefinitionRepository.save(config);

    return { success: true, fieldId, enabled };
  }

  /**
   * Update field required status
   */
  async updateFieldRequired(
    objectType: string,
    fieldId: string,
    required: boolean,
  ): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    const definition = config.definition;
    let fieldFound = false;

    // Navigate through portlets > blocks > fields to find and update the field
    for (const portlet of definition.portlets || []) {
      for (const block of portlet.blocks || []) {
        const field = block.fields?.find((f: any) => f.id === fieldId);
        if (field) {
          field.required = required;
          fieldFound = true;
          break;
        }
      }
      if (fieldFound) break;
    }

    if (!fieldFound) {
      throw new NotFoundException(`Field ${fieldId} not found in ${objectType}`);
    }

    config.definition = definition;
    await this.objectDefinitionRepository.save(config);

    return { success: true, fieldId, required };
  }

  /**
   * Reset object definition to default (delete custom configuration)
   */
  async resetObjectDefinition(objectType: string): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (config) {
      await this.objectDefinitionRepository.remove(config);
    }

    return { success: true, objectType, message: 'Configuration reset to default' };
  }

  /**
   * Export object definition as JSON
   */
  async exportObjectDefinition(objectType: string): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    return {
      version: config.version,
      objectType: config.objectType,
      exportedAt: new Date().toISOString(),
      definition: config.definition,
    };
  }

  /**
   * Import object definition from JSON
   */
  async importObjectDefinition(objectType: string, data: any): Promise<any> {
    if (!data.definition) {
      throw new BadRequestException('Invalid import data: missing definition');
    }

    const dto: SaveObjectDefinitionDto = {
      objectType,
      definition: data.definition,
      modifiedBy: 'import-system',
    };

    return this.saveObjectDefinition(dto);
  }

  /**
   * Get configuration metadata
   */
  async getConfigurationMetadata(objectType: string): Promise<any> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
      select: ['objectType', 'version', 'modifiedBy', 'updatedAt', 'createdAt'],
    });

    if (!config) {
      throw new NotFoundException(`Object definition for ${objectType} not found`);
    }

    return {
      objectType: config.objectType,
      version: config.version,
      modifiedBy: config.modifiedBy,
      lastModified: config.updatedAt.toISOString(),
      createdAt: config.createdAt.toISOString(),
    };
  }

  /**
   * Get enabled fields only (for use in forms)
   */
  async getEnabledFields(objectType: string): Promise<any[]> {
    const config = await this.objectDefinitionRepository.findOne({
      where: { objectType },
    });

    if (!config) {
      return []; // Return empty if no configuration found
    }

    const enabledFields: any[] = [];
    const definition = config.definition;

    // Extract all enabled and visible fields
    for (const portlet of definition.portlets || []) {
      if (!portlet.enabled || !portlet.visible) continue;

      for (const block of portlet.blocks || []) {
        if (!block.enabled || !block.visible) continue;

        for (const field of block.fields || []) {
          if (field.enabled && field.visible) {
            enabledFields.push(field);
          }
        }
      }
    }

    // Sort by order
    return enabledFields.sort((a, b) => a.order - b.order);
  }
}
