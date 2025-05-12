import { db } from "@/lib/db";
import { mcqs, chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MCQClientWrapper from "@/components/MCQClientWrapper";

const MCQListPage = async () => {
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
    .from(mcqs)
    .innerJoin(chats, eq(mcqs.chatId, chats.id))
    .where(eq(chats.userId, userId))
    .groupBy(chats.id);

  return <MCQClientWrapper initialChats={_chats} />;
};

export default MCQListPage;
