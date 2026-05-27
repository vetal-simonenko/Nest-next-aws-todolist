import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { DynamodbService } from '../aws/dynamodb/dynamodb.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(
    private readonly dynamodbService: DynamodbService,
    private readonly configService: ConfigService,
  ) {}

  private get tableName(): string {
    return this.configService.getOrThrow<string>('DYNAMODB_TODOS_TABLE');
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const now = new Date().toISOString();

    const todo: Todo = {
      id: randomUUID(),
      title: createTodoDto.title,
      description: createTodoDto.description,
      status: createTodoDto.status ?? 'todo',
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamodbService.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: todo,
      }),
    );

    return todo;
  }

  async findAll(): Promise<Todo[]> {
    const result = await this.dynamodbService.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );

    return (result.Items ?? []) as Todo[];
  }

  async findOne(id: string): Promise<Todo> {
    const result = await this.dynamodbService.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!result.Item) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return result.Item as Todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.findOne(id);

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updateTodoDto).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await this.dynamodbService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes as Todo;
  }

  async remove(id: string): Promise<Todo> {
    const todo = await this.findOne(id);

    await this.dynamodbService.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    return todo;
  }
}
