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
const mcqPrompt = `
You are an educational assistant tasked with creating effective multiple choice questions (MCQs) that follow the principles of self-contained learning and long-term memory retention.

Based on the provided content, generate 10 MCQs that meet the following criteria:

1. Each question must be **self-contained** — understandable on its own, without requiring the user to reference the original document.
2. Each question must focus on **important factual content**, such as definitions, causes, functions, outcomes, or characteristics.
3. Avoid vague, structural, or metadata questions (e.g. "Which section discusses X?", "Who is the author?", "On what page is this mentioned?")
4. Use **clear and specific wording** — avoid pronouns like “it,” “they,” or “this” without context.
5. Each question must include:
   - A single, clear question
   - Four distinct answer options
   - One clearly correct answer (must match exactly one of the options)

Respond only in this JSON format:
{
  "mcqs": [
    {
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    }
  ]
}
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
    const trimmedText = combinedText.slice(0, 4000);
    console.log("🧠 Sending prompt of length:", trimmedText.length);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3, // focused & consistent
      messages: [
        { role: "system", content: mcqPrompt },
        { role: "user", content: trimmedText }, // limit for safety
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

    let mcqJSON;
    try {
      mcqJSON = JSON.parse(response.choices[0].message.content || "{}");
    } catch (err) {
      console.error("❌ Failed to parse OpenAI output:", err);
      console.log("📄 Raw content:", content);
      return NextResponse.json(
        { error: "Invalid JSON from OpenAI" },
        { status: 500 }
      );
    }

    if (!Array.isArray(mcqJSON.mcqs)) {
      return NextResponse.json(
        { error: "Malformed MCQ data" },
        { status: 500 }
      );
    }

    await db.insert(mcqs).values(
      mcqJSON.mcqs.map((q: any) => ({
        chatId,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
      }))
    );

    console.log("✅ MCQs inserted into DB");
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
    const result = await db
      .select()
      .from(mcqs)
      .where(eq(mcqs.chatId, parseInt(chatId)));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to fetch MCQs:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
