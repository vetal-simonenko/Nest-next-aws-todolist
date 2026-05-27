import { IsString, MinLength } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @MinLength(1)
  fileName: string;

  @IsString()
  @MinLength(1)
  contentType: string;
}
