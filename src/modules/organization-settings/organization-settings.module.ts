import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  OrganizationSettingsController, 
  OrganizationSettingsCategoriesController,
  CompanyProfilesController
} from './organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings.service';
import { CompanyProfile } from './entities/company-profile.entity';
import { CompanyProfileAuditLog } from './entities/company-profile-audit.entity';
import { GroupCompany } from './entities/group-company.entity';
import { BusinessUnit } from './entities/business-unit.entity';
import { Division } from './entities/division.entity';
import { Department } from './entities/department.entity';
import { Capability } from './entities/capability.entity';
import { JobFamily } from './entities/job-family.entity';
import { RoleCategory } from './entities/role-category.entity';
import { FunctionalArea } from './entities/functional-area.entity';
import { Grade } from './entities/grade.entity';
import { Band } from './entities/band.entity';
import { LevelWithinBand } from './entities/level-within-band.entity';
import { DesignationName } from './entities/designation-name.entity';
import { Designation } from './entities/designation.entity';
import { DesignationTitle } from './entities/designation-title.entity';
import { Position } from './entities/position.entity';
import { SponsoringCompany } from './entities/sponsoring-company.entity';
import { JDTemplate } from './entities/jd-template.entity';
import { Country } from './entities/country.entity';
import { Region } from './entities/region.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { OfficeLocation } from './entities/office-location.entity';
import { WorkLocation } from './entities/work-location.entity';
import { LocationHierarchy } from './entities/location-hierarchy.entity';
import { GroupCompanyController } from './group-company.controller';
import { GroupCompanyService } from './group-company.service';
import { BusinessUnitController } from './business-unit.controller';
import { BusinessUnitService } from './business-unit.service';
import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { CapabilityController } from './capability.controller';
import { CapabilityService } from './capability.service';
import { JobFamilyController } from './job-family.controller';
import { JobFamilyService } from './job-family.service';
import { RoleCategoryController } from './controllers/role-category.controller';
import { RoleCategoryService } from './services/role-category.service';
import { FunctionalAreaController } from './controllers/functional-area.controller';
import { FunctionalAreaService } from './services/functional-area.service';
import { GradeController } from './controllers/grade.controller';
import { GradeService } from './services/grade.service';
import { BandController } from './controllers/band.controller';
import { BandService } from './services/band.service';
import { LevelWithinBandController } from './controllers/level-within-band.controller';
import { LevelWithinBandService } from './services/level-within-band.service';
import { DesignationNameController } from './controllers/designation-name.controller';
import { DesignationNameService } from './services/designation-name.service';
import { DesignationController } from './controllers/designation.controller';
import { DesignationService } from './services/designation.service';
import { DesignationTitleController } from './controllers/designation-title.controller';
import { DesignationTitleService } from './services/designation-title.service';
import { PositionController } from './controllers/position.controller';
import { PositionService } from './services/position.service';
import { SponsoringCompanyController } from './controllers/sponsoring-company.controller';
import { SponsoringCompanyService } from './services/sponsoring-company.service';
import { JDTemplateController } from './controllers/jd-template.controller';
import { JDTemplateService } from './services/jd-template.service';
import { CountryController } from './controllers/country.controller';
import { CountryService } from './services/country.service';
import { RegionController } from './controllers/region.controller';
import { RegionService } from './services/region.service';
import { StateController } from './controllers/state.controller';
import { StateService } from './services/state.service';
import { CityController } from './controllers/city.controller';
import { CityService } from './services/city.service';
import { OfficeLocationController, WorkLocationController, LocationHierarchyController } from './controllers/office-location.controller';
import { OfficeLocationService, WorkLocationService, LocationHierarchyService } from './services/office-location.service';
import { OrgViewSettingsController } from './controllers/org-view-settings.controller';
import { OrgViewSettingsService } from './services/org-view-settings.service';
import { OrgViewSettings } from './entities/org-view-settings.entity';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { ProfileFieldController } from './controllers/profile-field.controller';
import { ProfileFieldService } from './services/profile-field.service';
import { ProfileFieldDefinition } from './entities/profile-field-definition.entity';
import { ProfileFieldOption } from './entities/profile-field-option.entity';
import { NoticePeriodController } from './controllers/notice-period/notice-period.controller';
import { NoticePeriodService } from './services/notice-period/notice-period.service';
import { NoticePeriodPolicy } from './entities/notice-period-policy.entity';
import { EmployeeSeparation } from './entities/employee-separation.entity';
import { RetirementController } from './controllers/retirement/retirement.controller';
import { RetirementService } from './services/retirement/retirement.service';
import { RetirementPolicy } from './entities/retirement-policy.entity';
import { EmployeeRetirement } from './entities/employee-retirement.entity';
import { SeparationReasonController } from './controllers/separation-reason/separation-reason.controller';
import { SeparationReasonService } from './services/separation-reason/separation-reason.service';
import { SeparationReasonCategory } from './entities/separation-reason-category.entity';
import { SeparationReason } from './entities/separation-reason.entity';
import { AdditionalAssignmentController } from './controllers/additional-assignment/additional-assignment.controller';
import { AdditionalAssignmentService } from './services/additional-assignment/additional-assignment.service';
import { AdditionalAssignmentType } from './entities/additional-assignment-type.entity';
import { ObjectDefinitionConfig } from './entities/object-definition-config.entity';
import { ObjectDefinitionController } from './controllers/object-definition.controller';
import { ObjectDefinitionService } from './services/object-definition.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyProfile, 
      CompanyProfileAuditLog, 
      GroupCompany, 
      BusinessUnit, 
      Division, 
      Department, 
      Capability, 
      JobFamily, 
      RoleCategory,
      FunctionalArea,
      Grade,
      Band,
      LevelWithinBand,
      DesignationName,
      Designation,
      DesignationTitle,
      Position,
      SponsoringCompany,
      JDTemplate,
      OrgViewSettings,
      SearchAnalytics,
      ProfileFieldDefinition,
      ProfileFieldOption,
      Country,
      Region,
      State,
      City,
      OfficeLocation,
      WorkLocation,
      LocationHierarchy,
      NoticePeriodPolicy,
      EmployeeSeparation,
      RetirementPolicy,
      EmployeeRetirement,
      SeparationReasonCategory,
      SeparationReason,
      AdditionalAssignmentType,
      ObjectDefinitionConfig,
    ])
  ],
  controllers: [
    OrganizationSettingsController,
    OrganizationSettingsCategoriesController,
    CompanyProfilesController,
    GroupCompanyController,
    BusinessUnitController,
    DivisionController,
    DepartmentController,
    CapabilityController,
    JobFamilyController,
    RoleCategoryController,
    FunctionalAreaController,
    GradeController,
    BandController,
    LevelWithinBandController,
    DesignationNameController,
    DesignationController,
    DesignationTitleController,
    PositionController,
    SponsoringCompanyController,
    JDTemplateController,
    CountryController,
    RegionController,
    StateController,
    CityController,
    OfficeLocationController,
    WorkLocationController,
    ProfileFieldController,
    LocationHierarchyController,
    OrgViewSettingsController,
    NoticePeriodController,
    RetirementController,
    SeparationReasonController,
    AdditionalAssignmentController,
    ObjectDefinitionController,
  ],
  providers: [
    OrganizationSettingsService, 
    GroupCompanyService, 
    BusinessUnitService, 
    DivisionService, 
    DepartmentService, 
    CapabilityService, 
    JobFamilyService, 
    RoleCategoryService,
    FunctionalAreaService,
    GradeService,
    BandService,
    LevelWithinBandService,
    DesignationNameService,
    DesignationService,
    DesignationTitleService,
    PositionService,
    SponsoringCompanyService,
    JDTemplateService,
    CountryService,
    RegionService,
    StateService,
    CityService,
    OfficeLocationService,
    WorkLocationService,
    LocationHierarchyService,
    ProfileFieldService,
    OrgViewSettingsService,
    NoticePeriodService,
    RetirementService,
    SeparationReasonService,
    AdditionalAssignmentService,
  ],
  exports: [
    OrganizationSettingsService, 
    GroupCompanyService, 
    BusinessUnitService, 
    DivisionService, 
    DepartmentService, 
    CapabilityService, 
    JobFamilyService, 
    RoleCategoryService,
    FunctionalAreaService,
    GradeService,
    BandService,
    LevelWithinBandService,
    DesignationNameService,
    DesignationService,
    DesignationTitleService,
    PositionService,
    SponsoringCompanyService,
    JDTemplateService,
    CountryService,
    RegionService,
    StateService,
    CityService,
    OfficeLocationService,
    WorkLocationService,
    LocationHierarchyService,
    ProfileFieldService,
    OrgViewSettingsService,
    WorkLocationService,
    LocationHierarchyService,
    NoticePeriodService,
    RetirementService,
    SeparationReasonService,
    AdditionalAssignmentService,
    ObjectDefinitionService,
  ],
export class OrganizationSettingsModule {}
