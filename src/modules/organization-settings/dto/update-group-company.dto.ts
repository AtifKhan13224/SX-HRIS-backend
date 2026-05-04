import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupCompanyDto } from './create-group-company.dto';

export class UpdateGroupCompanyDto extends PartialType(CreateGroupCompanyDto) {}
