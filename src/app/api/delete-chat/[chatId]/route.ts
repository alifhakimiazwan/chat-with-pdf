import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust path based on your setup
import { chats } from "@/lib/db/schema"; // Adjust the import to match your schema
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId, 10);

    // Ensure chatId is valid
    if (isNaN(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    // Delete the chat from the database
    await db.delete(chats).where(eq(chats.id, chatId));

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
