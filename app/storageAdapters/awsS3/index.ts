import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, S3Client, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fse from "fs-extra";
import path from "path";
import { Readable } from "stream";
import { PROJECT_ROOT } from '~/helpers/projectRoot';
import registerStorageAdapter from "~/modules/storage/helpers/registerStorageAdapter";

const S3_MAX_BATCH_SIZE = 1000; // AWS S3 limit for DeleteObjectsCommand and ListObjectsV2

function getS3Client() {
  const { AWS_REGION, AWS_KEY, AWS_SECRET } = process.env;
  if (!AWS_REGION || !AWS_KEY || !AWS_SECRET) {
    throw new Error("Missing AWS configuration: AWS_REGION, AWS_KEY, or AWS_SECRET");
  }
  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_KEY,
      secretAccessKey: AWS_SECRET
    }
  });
}

function getAwsBucket() {
  const { AWS_BUCKET } = process.env;
  if (!AWS_BUCKET) {
    throw new Error("Missing AWS configuration: AWS_BUCKET");
  }
  return AWS_BUCKET;
}

registerStorageAdapter({
  name: 'AWS_S3',
  download: async ({ sourcePath }: { sourcePath: string }): Promise<string> => {
    const s3Client = getS3Client();

    const params = {
      Bucket: getAwsBucket(),
      Key: sourcePath
    };

    try {
      const data = await s3Client.send(new GetObjectCommand(params));
      if (data.Body && data.Body instanceof Readable) {
        const tmpPath = path.join(PROJECT_ROOT, 'tmp', sourcePath);
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
      throw new Error(`AWS_S3: No file body returned for ${sourcePath}`);
    } catch (error) {
      throw new Error(`AWS_S3 download error for ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  upload: async ({ file, uploadPath }: { file: { buffer: Buffer, contentType: string, size: number }, uploadPath: string }): Promise<void> => {

    const { buffer, contentType, size } = file;

    const s3Client = getS3Client();

    const ACL: "private" = "private";

    try {

      const fileSizeInBytes = size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
      console.log('uploadAsset:size', fileSizeInMegabytes);

      let params = { Bucket: getAwsBucket(), Key: uploadPath, Body: buffer, ACL, ContentType: contentType };

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
  remove: async ({ sourcePath }: { sourcePath: string }) => {
    const s3Client = getS3Client();
    const command = new DeleteObjectCommand({ Bucket: getAwsBucket(), Key: sourcePath });
    await s3Client.send(command);
    console.log(`AWS_S3: Deleted file ${sourcePath}`);
  },
  removeDir: async ({ sourcePath }: { sourcePath: string }) => {
    const s3Client = getS3Client();
    const bucket = getAwsBucket();
    const prefix = sourcePath.endsWith('/') ? sourcePath : `${sourcePath}/`;

    try {
      const paginator = paginateListObjectsV2({ client: s3Client, pageSize: S3_MAX_BATCH_SIZE }, { Bucket: bucket, Prefix: prefix });

      for await (const page of paginator) {
        if (!page.Contents || page.Contents.length === 0) continue;

        const keysToDelete = page.Contents.map(object => ({ Key: object.Key! }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keysToDelete }
        });
        await s3Client.send(deleteCommand);
      }
    } catch (error) {
      console.error(`AWS_S3: Error deleting directory ${sourcePath}:`, error);
      throw error;
    }
  },
  request: async (url, options) => {
    const s3Client = getS3Client();

    const params = {
      Bucket: getAwsBucket(),
      Key: url
    };

    const command = new GetObjectCommand(params);
    const requestUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return requestUrl;
  }
})
