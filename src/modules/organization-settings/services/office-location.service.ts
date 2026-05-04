import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeLocation } from '../entities/office-location.entity';
import { WorkLocation } from '../entities/work-location.entity';
import { LocationHierarchy } from '../entities/location-hierarchy.entity';
import { CreateOfficeLocationDto, UpdateOfficeLocationDto, CreateWorkLocationDto, UpdateWorkLocationDto, CreateLocationHierarchyDto, UpdateLocationHierarchyDto } from '../dto/office-location.dto';

@Injectable()
export class OfficeLocationService {
  constructor(
    @InjectRepository(OfficeLocation)
    private readonly officeLocationRepository: Repository<OfficeLocation>,
  ) {}

  async create(createDto: CreateOfficeLocationDto): Promise<OfficeLocation> {
    const existing = await this.officeLocationRepository.findOne({ where: { officeCode: createDto.officeCode } });
    if (existing) throw new BadRequestException(`Office with code ${createDto.officeCode} already exists`);
    const office = this.officeLocationRepository.create(createDto);
    return await this.officeLocationRepository.save(office);
  }

  async findAll(groupCompanyId?: string, search?: string): Promise<OfficeLocation[]> {
    const query = this.officeLocationRepository.createQueryBuilder('office');
    if (groupCompanyId) query.andWhere('office.groupCompanyId = :groupCompanyId', { groupCompanyId });
    if (search) query.andWhere('(office.officeCode ILIKE :search OR office.officeName ILIKE :search)', { search: `%${search}%` });
    return await query.orderBy('office.officeName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<OfficeLocation> {
    const office = await this.officeLocationRepository.findOne({ where: { id } });
    if (!office) throw new NotFoundException(`Office with ID ${id} not found`);
    return office;
  }

  async update(id: string, updateDto: UpdateOfficeLocationDto): Promise<OfficeLocation> {
    const office = await this.findOne(id);
    Object.assign(office, updateDto);
    return await this.officeLocationRepository.save(office);
  }

  async remove(id: string): Promise<void> {
    const office = await this.findOne(id);
    await this.officeLocationRepository.remove(office);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.officeLocationRepository.createQueryBuilder('office');
    if (groupCompanyId) query.where('office.groupCompanyId = :groupCompanyId', { groupCompanyId });
    
    const totalOffices = await query.getCount();
    const activeOffices = await query.andWhere('office.isActive = :isActive', { isActive: true }).getCount();
    
    return { totalOffices, activeOffices };
  }
}

@Injectable()
export class WorkLocationService {
  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
  ) {}

  async create(createDto: CreateWorkLocationDto): Promise<WorkLocation> {
    const existing = await this.workLocationRepository.findOne({ where: { locationCode: createDto.locationCode } });
    if (existing) throw new BadRequestException(`Work location with code ${createDto.locationCode} already exists`);
    const location = this.workLocationRepository.create(createDto);
    return await this.workLocationRepository.save(location);
  }

  async findAll(groupCompanyId?: string, search?: string): Promise<WorkLocation[]> {
    const query = this.workLocationRepository.createQueryBuilder('location');
    if (groupCompanyId) query.andWhere('location.groupCompanyId = :groupCompanyId', { groupCompanyId });
    if (search) query.andWhere('(location.locationCode ILIKE :search OR location.locationName ILIKE :search)', { search: `%${search}%` });
    return await query.orderBy('location.locationName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<WorkLocation> {
    const location = await this.workLocationRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException(`Work location with ID ${id} not found`);
    return location;
  }

  async update(id: string, updateDto: UpdateWorkLocationDto): Promise<WorkLocation> {
    const location = await this.findOne(id);
    Object.assign(location, updateDto);
    return await this.workLocationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.workLocationRepository.remove(location);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.workLocationRepository.createQueryBuilder('location');
    if (groupCompanyId) query.where('location.groupCompanyId = :groupCompanyId', { groupCompanyId });
    
    const totalLocations = await query.getCount();
    const activeLocations = await query.andWhere('location.isActive = :isActive', { isActive: true }).getCount();
    
    return { totalLocations, activeLocations };
  }
}

@Injectable()
export class LocationHierarchyService {
  constructor(
    @InjectRepository(LocationHierarchy)
    private readonly hierarchyRepository: Repository<LocationHierarchy>,
  ) {}

  async create(createDto: CreateLocationHierarchyDto): Promise<LocationHierarchy> {
    const existing = await this.hierarchyRepository.findOne({ where: { hierarchyCode: createDto.hierarchyCode } });
    if (existing) throw new BadRequestException(`Hierarchy with code ${createDto.hierarchyCode} already exists`);
    const hierarchy = this.hierarchyRepository.create(createDto);
    return await this.hierarchyRepository.save(hierarchy);
  }

  async findAll(groupCompanyId?: string, locationType?: string): Promise<LocationHierarchy[]> {
    const query = this.hierarchyRepository.createQueryBuilder('hierarchy');
    if (groupCompanyId) query.andWhere('hierarchy.groupCompanyId = :groupCompanyId', { groupCompanyId });
    if (locationType) query.andWhere('hierarchy.locationType = :locationType', { locationType });
    return await query.orderBy('hierarchy.hierarchyLevel', 'ASC').getMany();
  }

  async findOne(id: string): Promise<LocationHierarchy> {
    const hierarchy = await this.hierarchyRepository.findOne({ where: { id } });
    if (!hierarchy) throw new NotFoundException(`Hierarchy with ID ${id} not found`);
    return hierarchy;
  }

  async update(id: string, updateDto: UpdateLocationHierarchyDto): Promise<LocationHierarchy> {
    const hierarchy = await this.findOne(id);
    Object.assign(hierarchy, updateDto);
    return await this.hierarchyRepository.save(hierarchy);
  }

  async remove(id: string): Promise<void> {
    const hierarchy = await this.findOne(id);
    await this.hierarchyRepository.remove(hierarchy);
  }

  async getTree(groupCompanyId?: string): Promise<any> {
    const query = this.hierarchyRepository.createQueryBuilder('hierarchy');
    if (groupCompanyId) query.where('hierarchy.groupCompanyId = :groupCompanyId', { groupCompanyId });
    
    const hierarchies = await query.orderBy('hierarchy.hierarchyLevel', 'ASC').getMany();
    return this.buildTree(hierarchies);
  }

  private buildTree(hierarchies: LocationHierarchy[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    hierarchies.forEach((h) => {
      map.set(h.id, { ...h, children: [] });
    });

    hierarchies.forEach((h) => {
      const node = map.get(h.id);
      if (h.parentHierarchyId && map.has(h.parentHierarchyId)) {
        const parent = map.get(h.parentHierarchyId);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
