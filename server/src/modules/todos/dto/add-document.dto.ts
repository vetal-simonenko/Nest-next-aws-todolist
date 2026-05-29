import { IsString, MinLength } from 'class-validator';

export class AddDocumentDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  @MinLength(1)
  fileName: string;

  @IsString()
  @MinLength(1)
  contentType: string;
}
