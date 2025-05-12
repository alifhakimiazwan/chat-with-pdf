import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
  params: { chatId: string };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats.length) {
    return redirect("/dashboard/chat");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  console.log(currentChat?.pdfUrl);
  if (!currentChat) {
    return redirect("/dashboard/chat");
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex-[3] p-4">
        {" "}
        {/* Increase width for PDFViewer */}
        <PDFViewer pdfUrl={currentChat.pdfUrl} />
      </div>

      <div className="flex-[2] border-l border-gray-300">
        {" "}
        {/* Increase width for ChatComponent */}
        <ChatComponent chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default ChatPage;
