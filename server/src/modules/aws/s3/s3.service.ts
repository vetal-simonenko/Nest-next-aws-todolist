import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  GetObjectCommand,
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
}
