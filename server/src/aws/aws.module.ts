import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb/dynamodb.service';

@Module({
  providers: [DynamodbService],
  exports: [DynamodbService],
})
export class AwsModule {}
