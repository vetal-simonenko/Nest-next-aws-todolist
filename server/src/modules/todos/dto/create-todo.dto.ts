import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTodoDto {
    @IsString()
    @MinLength(2)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn(['todo', 'in_progress', 'done'])
    status?: 'todo' | 'in_progress' | 'done';
}