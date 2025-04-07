import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";

export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve) => {
    try {
      const s3 = new S3({
        region: "ap-southeast-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };

      const obj = await s3.getObject(params);

      const file_name = `/tmp/pdf-${Date.now()}.pdf`;

      if (obj.Body instanceof Readable) {
        // AWS-SDK v3 has some issues with their typescript definitions, but this works
        // https://github.com/aws/aws-sdk-js-v3/issues/843
        //open the writable stream and write the file
        const file = fs.createWriteStream(file_name);
        file.on("open", function () {
          // @ts-expect-error AWS SDK v3 types don't fully align with Node.js stream types

          obj.Body?.pipe(file).on("finish", () => {
            return resolve(file_name);
          });
        });
        // obj.Body?.pipe(fs.createWriteStream(file_name));
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  });
}
