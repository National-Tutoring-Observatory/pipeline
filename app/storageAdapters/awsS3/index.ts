import registerStorage from "~/core/storage/helpers/registerStorage";
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import getFileInfo from "~/core/storage/helpers/getFileInfo";
import fse from "fs-extra";
import path from "path";
import { Readable } from "stream";

registerStorage({
  name: 'AWS_S3',
  download: async ({ downloadPath }: { downloadPath: string }) => {
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
        const downloadDirectory = path.dirname(path.join('tmp', downloadPath));
        await fse.ensureDir(downloadDirectory);
        const fileStream = fse.createWriteStream(path.join('tmp', downloadPath));
        data.Body.pipe(fileStream);

        await new Promise((resolve, reject) => {
          fileStream.on("finish", () => resolve(undefined));
          fileStream.on("error", reject);
        });

      }

    } catch (error) {
      console.log('AWS_S3 download error', error);
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
})