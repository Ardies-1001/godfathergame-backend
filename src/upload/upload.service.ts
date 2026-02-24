import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') || 'godfather-game';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      console.warn('R2 credentials missing. Uploads will fail.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'misc',
  ): Promise<{ url: string; key: string }> {
    return this.uploadBuffer(
      file.buffer,
      file.mimetype,
      extname(file.originalname),
      folder,
    );
  }

  async uploadBase64(
    base64String: string,
    folder: string = 'misc',
  ): Promise<string> {
    // Check if it's a base64 string
    if (
      !base64String ||
      typeof base64String !== 'string' ||
      !base64String.startsWith('data:')
    ) {
      return base64String; // Return as is if not base64 (maybe already a URL)
    }

    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If regex fails but starts with data:, it might be malformed, but let's just return it or throw
      console.warn('Invalid base64 string format, skipping upload');
      return base64String;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Determine extension from mime type
    let ext = '.jpg';
    if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/gif') ext = '.gif';
    else if (mimeType === 'image/webp') ext = '.webp';
    else if (mimeType === 'image/jpeg') ext = '.jpg';

    const { url } = await this.uploadBuffer(buffer, mimeType, ext, folder);
    return url;
  }

  private async uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    ext: string,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const fileName = `${uuidv4()}${ext}`;
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const key = `${cleanFolder}/${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // ACL: 'public-read', // Removed as R2 often doesn't support ACLs in the same way or it's bucket-level
      }),
    );

    const url = this.publicUrl
      ? `${this.publicUrl.replace(/\/+$/, '')}/${key}`
      : `${this.configService.get('R2_ENDPOINT')}/${this.bucketName}/${key}`;

    return { url, key };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract key from URL
      // URL format: https://<domain>/<key> or <endpoint>/<bucket>/<key>
      let key = '';

      if (this.publicUrl && fileUrl.startsWith(this.publicUrl)) {
        key = fileUrl.replace(this.publicUrl.replace(/\/+$/, '') + '/', '');
      } else {
        const urlObj = new URL(fileUrl);
        key = urlObj.pathname.substring(1);
      }

      if (!key) {
        console.warn(`Could not extract key from URL: ${fileUrl}`);
        return;
      }

      console.log(`Deleting file from R2: ${key}`);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error(`Error deleting file ${fileUrl}:`, error);
      // We don't throw here to avoid blocking the main deletion flow
    }
  }
}
