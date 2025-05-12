import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, podcasts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { downloadFromS3 } from "@/lib/db/s3-server";
import { uploadPodcastToS3 } from "@/lib/db/s3";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import OpenAI from "openai";
import textToSpeech from "@google-cloud/text-to-speech";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import fs from "fs";

function setupGoogleCredentials() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    throw new Error("Google credentials not found in environment variables");
  }

  const credentialsPath = "/tmp/google-credentials.json";
  const buffer = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  );

  fs.writeFileSync(credentialsPath, buffer);

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

setupGoogleCredentials();
const client = new textToSpeech.TextToSpeechClient();

const podcastPrompt = `
You are a podcast script writer. Based on the provided text, generate a podcast episode script suitable for a 2 minute podcast. 
Keep it conversational, clear, and informative. Start with a short introduction, then summarize the key content from the text in a narrative tone.
Close with a thoughtful conclusion. Make it sound like a human podcast host is speaking. Do not include any section such as "Introduction" or "Conclusion" in the script.
`;

// Google TTS client setup

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    // Check if podcast already exists
    const existingPodcast = await db
      .select()
      .from(podcasts)
      .where(eq(podcasts.chatId, chatId))
      .then((res) => res[0]);

    if (existingPodcast) {
      console.log("📂 Podcast already exists.");
      return NextResponse.json({
        podcastUrl: existingPodcast.podcastUrl,
        script: existingPodcast.script,
        success: true,
      });
    }

    // Fetch chat data
    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .then((res) => res[0]);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Download PDF and generate script
    const filePath = await downloadFromS3(chat.fileKey);
    const loader = new PDFLoader(filePath);
    const pages = await loader.load();
    const combinedText = pages.map((p) => p.pageContent).join("\n\n");
    const trimmedText = combinedText.slice(0, 4000);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: podcastPrompt },
        {
          role: "user",
          content: `Here is the content to be transformed into a podcast script:\n\n${trimmedText}`,
        },
      ],
    });

    const script = response.choices?.[0]?.message?.content;

    if (!script) {
      throw new Error("No script generated");
    }

    // Generate audio from script using Google TTS
    const ttsRequest = {
      input: { text: script },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };
    const [ttsResponse] = await client.synthesizeSpeech(ttsRequest);
    if (!ttsResponse.audioContent) {
      throw new Error("TTS audio content generation failed");
    }

    // Upload audio to S3
    const audioUrl = await uploadPodcastToS3(
      ttsResponse.audioContent,
      chat.pdfName
    );

    // Save podcast metadata to the database
    await db.insert(podcasts).values({
      chatId,
      podcastUrl: audioUrl,
      pdfName: chat.pdfName,
      script,
    });

    console.log("✅ Podcast generated and saved.");
    return NextResponse.json({ podcastUrl: audioUrl, script, success: true });
  } catch (error) {
    console.error("🎙️ Podcast generation failed:", error);
    return NextResponse.json(
      { error: "Podcast generation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await db.select().from(podcasts);

    if (data.length === 0) {
      return NextResponse.json(
        { message: "No podcasts found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch podcasts:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
