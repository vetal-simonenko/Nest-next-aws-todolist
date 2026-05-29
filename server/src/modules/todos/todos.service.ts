import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
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
import { S3Service } from '../aws/s3/s3.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { AddDocumentDto } from './dto/add-document.dto';
import { FindTodosQueryDto } from './dto/find-todos-query.dto';

@Injectable()
export class TodosService {
  constructor(
    private readonly dynamodbService: DynamodbService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  private get tableName(): string {
    return this.configService.getOrThrow<string>('DYNAMODB_TODOS_TABLE');
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const now = new Date().toISOString();

    const todo: Todo = {
      id: randomUUID(),
      entityType: 'TODO',
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

  async findAll(query: FindTodosQueryDto): Promise<{
    items: Todo[];
    nextCursor: string | null;
  }> {
    const limit = query.limit ? Number(query.limit) : 10;

    let exclusiveStartKey = query.cursor
      ? JSON.parse(Buffer.from(query.cursor, 'base64').toString('utf-8'))
      : undefined;

    const search = query.search?.trim().toLowerCase();

    if (!search) {
      const result = await this.dynamodbService.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'TodosByCreatedAtIndex',
          KeyConditionExpression: '#entityType = :entityType',
          ExpressionAttributeNames: {
            '#entityType': 'entityType',
          },
          ExpressionAttributeValues: {
            ':entityType': 'TODO',
          },
          Limit: limit,
          ExclusiveStartKey: exclusiveStartKey,
          ScanIndexForward: false,
        }),
      );

      return {
        items: (result.Items ?? []) as Todo[],
        nextCursor: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
              'base64',
            )
          : null,
      };
    }

    const matchedItems: Todo[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const result = await this.dynamodbService.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'TodosByCreatedAtIndex',
          KeyConditionExpression: '#entityType = :entityType',
          ExpressionAttributeNames: {
            '#entityType': 'entityType',
          },
          ExpressionAttributeValues: {
            ':entityType': 'TODO',
          },
          Limit: limit,
          ExclusiveStartKey: exclusiveStartKey,
          ScanIndexForward: false,
        }),
      );

      const items = (result.Items ?? []) as Todo[];

      const found = items.filter((item) => {
        const title = item.title?.toLowerCase() ?? '';
        const description = item.description?.toLowerCase() ?? '';

        return title.includes(search) || description.includes(search);
      });

      matchedItems.push(...found);

      lastEvaluatedKey = result.LastEvaluatedKey;
      exclusiveStartKey = result.LastEvaluatedKey;
    } while (matchedItems.length < limit + 1 && lastEvaluatedKey);

    const itemsToReturn = matchedItems.slice(0, limit);
    const hasMore = matchedItems.length > limit;

    const lastReturnedItem = itemsToReturn.at(-1);

    return {
      items: itemsToReturn,
      nextCursor:
        hasMore && lastReturnedItem
          ? Buffer.from(
              JSON.stringify({
                id: lastReturnedItem.id,
                entityType: lastReturnedItem.entityType,
                createdAt: lastReturnedItem.createdAt,
              }),
            ).toString('base64')
          : null,
    };
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

    await this.s3Service.deleteTodoFiles(id);

    await this.dynamodbService.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    return todo;
  }

  async createDocumentUploadUrl(id: string, dto: CreateUploadUrlDto) {
    await this.findOne(id);

    const documentId = randomUUID();
    const key = `todos/${id}/documents/${documentId}-${dto.fileName}`;

    const uploadUrl = await this.s3Service.createPresignedUploadUrl({
      key,
      contentType: dto.contentType,
    });

    return {
      uploadUrl,
      key,
      fileName: dto.fileName,
      contentType: dto.contentType,
    };
  }

  async addDocument(id: string, dto: AddDocumentDto): Promise<Todo> {
    await this.findOne(id);

    const document = {
      key: dto.key,
      fileName: dto.fileName,
      contentType: dto.contentType,
      uploadedAt: new Date().toISOString(),
    };

    const result = await this.dynamodbService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'SET #documents = list_append(if_not_exists(#documents, :emptyList), :document), #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#documents': 'documents',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':emptyList': [],
          ':document': [document],
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes as Todo;
  }

  async createDocumentDownloadUrl(id: string, key: string) {
    const todo = await this.findOne(id);

    const document = todo.documents?.find((item) => item.key === key);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const downloadUrl = await this.s3Service.createPresignedDownloadUrl(key);

    return {
      downloadUrl,
      key,
      fileName: document.fileName,
      contentType: document.contentType,
    };
  }

  async removeDocument(id: string, key: string): Promise<Todo> {
    const todo = await this.findOne(id);

    const document = todo.documents?.find((item) => item.key === key);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.s3Service.deleteFile(key);

    const updatedDocuments =
      todo.documents?.filter((item) => item.key !== key) ?? [];

    const result = await this.dynamodbService.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'SET #documents = :documents, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#documents': 'documents',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':documents': updatedDocuments,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes as Todo;
  }
}
