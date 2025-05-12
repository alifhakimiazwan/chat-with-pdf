// lib/pdf.ts
import { getS3Url } from "../db/s3"; // your helper to get full PDF URL
import pdf from "pdf-parse";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getTextFromPdf(fileKey: string): Promise<string> {
  const fileUrl = await getS3Url(fileKey);

  const res = await fetch(fileUrl);
  const buffer = await res.arrayBuffer();

  const data = await pdf(Buffer.from(buffer));
  return data.text;
}

export async function getFileBufferFromKey(fileKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
  });

  const response = await s3Client.send(command);
  const stream = response.Body as ReadableStream;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
