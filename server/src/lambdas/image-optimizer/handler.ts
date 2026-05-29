import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { S3Event } from 'aws-lambda';
import sharp from 'sharp';

const s3Client = new S3Client({});

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function getOptimizedKey(originalKey: string, format: 'webp' | 'avif') {
  const lastSlashIndex = originalKey.lastIndexOf('/');
  const folder = originalKey.slice(0, lastSlashIndex);
  const fileName = originalKey.slice(lastSlashIndex + 1);
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

  return `${folder}/optimized/${format}/${fileNameWithoutExtension}.${format}`;
}

export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (key.startsWith('optimized/')) {
      console.log(`Skipping optimized file: ${key}`);
      continue;
    }

    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const contentType = object.ContentType ?? '';

    if (!SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      console.log(`Skipping unsupported file type: ${contentType}`);
      continue;
    }

    if (!object.Body) {
      console.log(`Skipping empty object: ${key}`);
      continue;
    }

    const originalBuffer = await streamToBuffer(
      object.Body as NodeJS.ReadableStream,
    );

    const webpBuffer = await sharp(originalBuffer)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    const avifBuffer = await sharp(originalBuffer)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .avif({
        quality: 50,
      })
      .toBuffer();

    await Promise.all([
      s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: getOptimizedKey(key, 'webp'),
          Body: webpBuffer,
          ContentType: 'image/webp',
        }),
      ),

      s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: getOptimizedKey(key, 'avif'),
          Body: avifBuffer,
          ContentType: 'image/avif',
        }),
      ),
    ]);

    console.log(`Optimized image created for: ${key}`);
  }
}
