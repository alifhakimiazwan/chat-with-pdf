import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats, flashcards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import FlashcardClientWrapper from "@/components/FlashcardClientWrapper";
const FlashcardListPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db
    .select({
      chatId: chats.id,
      pdfName: chats.pdfName,
      createdAt: chats.createdAt,
    })
    .from(chats)
    .innerJoin(flashcards, eq(chats.id, flashcards.chatId))
    .where(eq(chats.userId, userId))
    .groupBy(chats.id);

  return <FlashcardClientWrapper initialChats={_chats} />;
};

export default FlashcardListPage;
