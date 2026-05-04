import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
