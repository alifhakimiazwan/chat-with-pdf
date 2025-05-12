import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, flashcards, mcqs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import pdfParse from "pdf-parse";
import { downloadFromS3 } from "@/lib/db/s3-server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const podcastPrompt = `
You are a podcast script writer. Based on the provided text, generate a podcast episode script suitable for a 2 minute podcast. 
Keep it conversational, clear, and informative. Start with a short introduction, then summarize the key content from the text in a narrative tone.
Close with a thoughtful conclusion. Make it sound like a human podcast host is speaking.
`;

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();
    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .then((res) => res[0]);
    const filePath = await downloadFromS3(chat.fileKey);

    const loader = new PDFLoader(filePath);
    const pages = (await loader.load()) as PDFPage[];
    const combinedText = pages.map((p) => p.pageContent).join("\n\n");
    const trimmedText = combinedText.slice(0, 4000);

    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: podcastPrompt },
        { role: "user", content: `Text:\n${trimmedText}` },
      ],
    });

    const script = response.choices?.[0]?.message?.content;

    // Save script to database if needed
    return NextResponse.json({ script });
  } catch (error) {
    console.error("Podcast generation failed:", error);
    return NextResponse.json(
      { error: "Podcast generation failed" },
      { status: 500 }
    );
  }
}
