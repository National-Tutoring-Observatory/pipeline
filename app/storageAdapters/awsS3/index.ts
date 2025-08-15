import registerStorage from "~/core/storage/helpers/registerStorage";
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

registerStorage({
  name: 'AWS_S3',
  upload: async ({ file, uploadPath, uploadDirectory }: { file: File, uploadPath: string, uploadDirectory: string }): Promise<void> => {

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
    const ContentType = file.type;

    try {

      const fileSizeInBytes = file.size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
      console.log('uploadAsset:size', fileSizeInMegabytes);

      let params = { Bucket: process.env.AWS_BUCKET, Key: uploadPath, Body: file, ACL, ContentType };

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