import { S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";
import { APP_CONFIG } from '@app/app.constants';


export async function generateUploadURL(details: { folder: string; mediaName: string, contentType: string }) {

  const config_service = new ConfigService()

  const region = config_service.get<string>(APP_CONFIG.AWS_REGION);
  const bucket = config_service.get<string>(APP_CONFIG.AWS_BUCKET_NAME);
  const accessKeyId = config_service.get<string>(APP_CONFIG.AWS_ACCESS_KEY_ID);
  const secretAccessKey = config_service.get<string>(APP_CONFIG.AWS_ACCESS_KEY_SECRET);

  const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });

  const key = `${details.folder}/${details.mediaName}`;
  const command = new PutObjectCommand({ 
    Bucket: bucket, 
    Key: key,
    ACL: 'public-read',
    ContentType: details.contentType
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  const url = uploadUrl.split('?')[0];

  return {
      uploadUrl,
      url: key
    } 
}