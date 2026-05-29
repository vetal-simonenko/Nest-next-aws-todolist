import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
    });
  }

  private get bucketName(): string {
    return this.configService.getOrThrow<string>('S3_DOCUMENTS_BUCKET');
  }

  async createPresignedUploadUrl(params: {
    key: string;
    contentType: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow<string>('S3_DOCUMENTS_BUCKET'),
      Key: params.key,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 5,
    });
  }

  async createPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>('S3_DOCUMENTS_BUCKET'),
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 5,
    });
  }

  async deleteTodoFiles(todoId: string): Promise<void> {
    const prefix = `todos/${todoId}/`;

    const result = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      }),
    );

    const objects = result.Contents ?? [];

    if (objects.length === 0) {
      return;
    }

    await this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: objects
            .filter((object) => object.Key)
            .map((object) => ({
              Key: object.Key!,
            })),
        },
      }),
    );
  }
}
