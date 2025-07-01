import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, flashcards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import pdfParse from "pdf-parse";
import { downloadFromS3 } from "@/lib/db/s3-server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const systemPrompt = `
You are a flashcard creator following SuperMemo principles.

Based on the provided text, create 10 high-quality flashcards that help users retain important factual knowledge. Follow these rules:

1. Each flashcard must be **self-contained** — the user should not need to refer to the original document.
2. Questions must be **clear, specific, and unambiguous**.
3. Each flashcard must cover **only one fact or idea**.
4. Do **not include trivia, document structure, metadata**, or vague questions (e.g., "What are the sections?", "Who is the author?").
5. Use **simple, academic phrasing** appropriate for studying factual material.
6. Avoid yes/no questions unless absolutely necessary.

Format your output strictly in this JSON structure:
{
  "flashcards": [
    {
      "front": "Question here",
      "back": "Answer here"
    }
  ]
}

Only include the flashcards. Do not include explanations or extra text.
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
    console.log("Chat ID received:", chatId);
    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .then((res) => res[0]);
    console.log("Chat retrieved:", chat);
    const fileKey = chat.fileKey;
    const filePath = await downloadFromS3(fileKey);
    console.log("📂 Downloaded filePath:", filePath);
    const loader = new PDFLoader(filePath);
    const pages = (await loader.load()) as PDFPage[];

    const combinedText = pages.map((p) => p.pageContent).join("\n\n");

    const trimmedText = combinedText.slice(0, 4000); // Adjust if needed
    console.log("🧠 Sending prompt of length:", trimmedText.length);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3, // focused & consistent
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Text:\n${trimmedText}` },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    console.log("🤖 OpenAI Response:", content);

    if (!content) {
      return NextResponse.json(
        { error: "No content from OpenAI" },
        { status: 500 }
      );
    }

    let flashcardJSON;
    try {
      flashcardJSON = JSON.parse(content);
    } catch (err) {
      console.error("❌ Failed to parse OpenAI output:", err);
      console.log("📄 Raw content:", content);
      return NextResponse.json(
        { error: "Invalid JSON from OpenAI" },
        { status: 500 }
      );
    }

    if (!Array.isArray(flashcardJSON.flashcards)) {
      return NextResponse.json(
        { error: "Malformed flashcard data" },
        { status: 500 }
      );
    }

    await db.insert(flashcards).values(
      flashcardJSON.flashcards.map((card: any) => ({
        front: card.front,
        back: card.back,
        chatId,
      }))
    );

    console.log("✅ Flashcards inserted into DB");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Flashcard generation failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
  }

  try {
    const data = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.chatId, parseInt(chatId)));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch flashcards:", err);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}
