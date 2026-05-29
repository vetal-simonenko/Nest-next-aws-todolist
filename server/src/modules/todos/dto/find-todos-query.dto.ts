import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindTodosQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
