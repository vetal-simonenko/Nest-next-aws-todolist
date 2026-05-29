import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { TodosService } from './todos.service';
import { AddDocumentDto } from './dto/add-document.dto';
import { UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { FindTodosQueryDto } from './dto/find-todos-query.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @UseGuards(CognitoAuthGuard)
  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  findAll(@Query() query: FindTodosQueryDto) {
    return this.todosService.findAll(query);
  }

  @UseGuards(CognitoAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @UseGuards(CognitoAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @UseGuards(CognitoAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }

  @UseGuards(CognitoAuthGuard)
  @Post(':id/documents/upload-url')
  createDocumentUploadUrl(
    @Param('id') id: string,
    @Body() createUploadUrlDto: CreateUploadUrlDto,
  ) {
    return this.todosService.createDocumentUploadUrl(id, createUploadUrlDto);
  }

  @UseGuards(CognitoAuthGuard)
  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() addDocumentDto: AddDocumentDto) {
    return this.todosService.addDocument(id, addDocumentDto);
  }

  @Get(':id/documents/download-url')
  createDocumentDownloadUrl(
    @Param('id') id: string,
    @Query('key') key: string,
  ) {
    return this.todosService.createDocumentDownloadUrl(id, key);
  }

  @Delete(':id/documents')
  removeDocument(@Param('id') id: string, @Query('key') key: string) {
    return this.todosService.removeDocument(id, key);
  }
}
