import { db } from "@/lib/db";
import { podcasts, chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PodcastClientWrapper from "@/components/PodcastClientWrapper";

const PodcastListPage = async () => {
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
    .from(podcasts)
    .innerJoin(chats, eq(podcasts.chatId, chats.id))
    .where(eq(chats.userId, userId))
    .groupBy(chats.id);

  return <PodcastClientWrapper initialChats={_chats} />;
};

export default PodcastListPage;
