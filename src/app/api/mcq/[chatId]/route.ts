import { db } from "@/lib/db";
import { mcqs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const chatId = parseInt(params.chatId);

  if (isNaN(chatId)) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  try {
    await db.delete(mcqs).where(eq(mcqs.chatId, chatId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete MCQs:", err);
    return NextResponse.json(
      { error: "Failed to delete MCQs" },
      { status: 500 }
    );
  }
}
