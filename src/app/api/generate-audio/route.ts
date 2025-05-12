// pages/api/generate-audio.ts
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import { NextResponse } from "next/server";
import { S3 } from "@aws-sdk/client-s3";

// Set the path to your Google Cloud service account file
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  "./chat-with-pdf-457515-0b2e03696b9b.json"
);

// AWS S3 Configuration
const s3 = new S3({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(filePath: string, fileName: string): Promise<string> {
  const fileContent = await util.promisify(fs.readFile)(filePath);

  const s3Key = `podcasts/${fileName}`;
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: s3Key,
    Body: fileContent,
    ContentType: "audio/mpeg",
  };

  await s3.putObject(params);
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
}

export async function POST(req: Request) {
  try {
    // Step 1: Validate the request body
    if (!req.body) {
      return NextResponse.json(
        { error: "Request body is missing" },
        { status: 400 }
      );
    }

    const { text, fileName } = await req.json();

    // Step 2: Check if text is valid and not empty
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Invalid or empty text for audio generation" },
        { status: 400 }
      );
    }

    // Step 3: Check if fileName is provided
    const audioFileName = fileName || `podcast-${Date.now()}`;

    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        ssmlGender: "NEUTRAL", // Options: MALE / FEMALE / NEUTRAL
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    // Step 4: Generate speech from text
    const [response] = await client.synthesizeSpeech(request);

    // Step 5: Check if audio content was generated
    if (!response.audioContent) {
      return NextResponse.json(
        { error: "Failed to generate audio content" },
        { status: 500 }
      );
    }

    const outputPath = `/tmp/${audioFileName}.mp3`;

    // Step 6: Save the audio file to the local file system
    await util.promisify(fs.writeFile)(
      outputPath,
      response.audioContent,
      "binary"
    );

    console.log(`✅ Audio content saved to: ${outputPath}`);

    // Step 7: Upload to S3
    const s3Url = await uploadToS3(outputPath, `${audioFileName}.mp3`);

    console.log(`🌐 Audio uploaded to S3: ${s3Url}`);

    // Step 8: Return the S3 URL as a response
    return NextResponse.json({ url: s3Url });
  } catch (error) {
    console.error("🎙️ Podcast generation failed:", error);
    return NextResponse.json(
      { error: "Podcast generation failed" },
      { status: 500 }
    );
  }
}
