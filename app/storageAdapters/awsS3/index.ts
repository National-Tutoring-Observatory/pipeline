import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fse from "fs-extra";
import path from "path";
import { Readable } from "stream";
import { PROJECT_ROOT } from '~/helpers/projectRoot';
import registerStorageAdapter from "~/modules/storage/helpers/registerStorageAdapter";

registerStorageAdapter({
  name: 'AWS_S3',
  download: async ({ downloadPath }: { downloadPath: string }): Promise<string> => {
    const { AWS_REGION, AWS_KEY, AWS_SECRET, AWS_BUCKET } = process.env;
    if (!AWS_REGION || !AWS_KEY || !AWS_SECRET || !AWS_BUCKET) {
      throw new Error("Missing AWS configuration: AWS_REGION, AWS_KEY, or AWS_SECRET");
    }
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_KEY,
        secretAccessKey: AWS_SECRET
      }
    });

    const params = {
      Bucket: AWS_BUCKET,
      Key: downloadPath
    };

    try {
      const data = await s3Client.send(new GetObjectCommand(params));
      if (data.Body && data.Body instanceof Readable) {
        const tmpPath = path.join(PROJECT_ROOT, 'tmp', downloadPath);
        const downloadDirectory = path.dirname(tmpPath);
        await fse.ensureDir(downloadDirectory);
        const fileStream = fse.createWriteStream(tmpPath);
        data.Body.pipe(fileStream);

        await new Promise((resolve, reject) => {
          fileStream.on("finish", () => resolve(undefined));
          fileStream.on("error", reject);
        });
        return tmpPath;
      }
      throw new Error(`AWS_S3: No file body returned for ${downloadPath}`);
    } catch (error) {
      throw new Error(`AWS_S3 download error for ${downloadPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  upload: async ({ file, uploadPath }: { file: { buffer: Buffer, contentType: string, size: number }, uploadPath: string }): Promise<void> => {

    const { buffer, contentType, size } = file;

    const { AWS_REGION, AWS_KEY, AWS_SECRET } = process.env;
    if (!AWS_REGION || !AWS_KEY || !AWS_SECRET) {
      throw new Error("Missing AWS configuration: AWS_REGION, AWS_KEY, or AWS_SECRET");
    }
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_KEY,
        secretAccessKey: AWS_SECRET
      }
    });

    const ACL: "private" = "private";

    try {

      const fileSizeInBytes = size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
      console.log('uploadAsset:size', fileSizeInMegabytes);

      let params = { Bucket: process.env.AWS_BUCKET, Key: uploadPath, Body: buffer, ACL, ContentType: contentType };

      const upload = new Upload({
        client: s3Client,
        params,
        partSize: 1024 * 1024 * 40, // optional size of each part, in bytes, at least 40MB
        queueSize: 1,
        leavePartsOnError: false, // optional manually handle dropped parts
      });

      upload.on("httpUploadProgress", (progress) => {
        console.log('uploadAsset:progress', progress);
      });

      await upload.done();

    } catch (error) {
      console.log(error);
    }


  },
  remove: () => { console.log('removing'); },
  request: async (url, options) => {

    const { AWS_REGION, AWS_KEY, AWS_SECRET, AWS_BUCKET } = process.env;
    if (!AWS_REGION || !AWS_KEY || !AWS_SECRET || !AWS_BUCKET) {
      throw new Error("Missing AWS configuration: AWS_REGION, AWS_KEY, or AWS_SECRET");
    }
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_KEY,
        secretAccessKey: AWS_SECRET
      }
    });

    const params = {
      Bucket: AWS_BUCKET,
      Key: url
    };

    const command = new GetObjectCommand(params);
    const requestUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return requestUrl;


  }
})
