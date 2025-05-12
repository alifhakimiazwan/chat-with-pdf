// pages/api/generate-audio.ts
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import { NextResponse } from "next/server";

// Point to your service account file
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  "./chat-with-pdf-457515-0b2e03696b9b.json"
);

export async function POST(req: Request) {
  const { text, fileName } = await req.json();

  const client = new textToSpeech.TextToSpeechClient();

  const request = {
    input: { text },
    voice: {
      languageCode: "en-US",
      ssmlGender: "NEUTRAL", // or MALE / FEMALE
    },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);

  const outputPath = `/tmp/${fileName || "podcast"}.mp3`;
  await util.promisify(fs.writeFile)(
    outputPath,
    response.audioContent,
    "binary"
  );

  return new NextResponse(response.audioContent, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${
        fileName || "podcast"
      }.mp3"`,
    },
  });
}
