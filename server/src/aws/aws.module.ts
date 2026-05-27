import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb/dynamodb.service';
import { S3Service } from './s3/s3.service';

@Module({
  providers: [DynamodbService, S3Service],
  exports: [DynamodbService, S3Service],
})
export class AwsModule {}
