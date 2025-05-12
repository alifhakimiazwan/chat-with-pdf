import { db } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
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
    await db.delete(flashcards).where(eq(flashcards.chatId, chatId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete flashcards:", err);
    return NextResponse.json(
      { error: "Failed to delete flashcards" },
      { status: 500 }
    );
  }
}
