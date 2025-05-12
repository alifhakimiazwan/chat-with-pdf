import { S3 } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  return new Promise((resolve, reject) => {
    try {
      const s3 = new S3({
        region: "ap-southeast-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });

      const file_key =
        "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
        Body: file,
      };
      s3.putObject(params, (err: Error | null) => {
        if (err) return reject(err); // now `err` is used correctly
        return resolve({
          file_key,
          file_name: file.name,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function uploadPodcastToS3(
  audioContent: Buffer,
  fileName: string
): Promise<string> {
  const s3 = new S3({
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    },
  });
  const file_key = `podcasts/${Date.now().toString()}-${fileName}.mp3`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: file_key,
    Body: audioContent,
    ContentType: "audio/mpeg",
  };

  await s3.putObject(params);
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${file_key}`;
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${file_key}`;
  return url;
}
