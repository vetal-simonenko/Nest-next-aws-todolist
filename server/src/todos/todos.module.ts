import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [AwsModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
