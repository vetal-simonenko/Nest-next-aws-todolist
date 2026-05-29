import { Module } from '@nestjs/common';
import { TodosModule } from './modules/todos/todos.module';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './modules/aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TodosModule,
    AwsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
