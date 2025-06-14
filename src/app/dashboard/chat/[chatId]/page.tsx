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
  if (!currentChat) {
    return redirect("/dashboard/chat");
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* PDF Viewer on top (mobile) or left (desktop) */}
      <div className="h-[40vh] md:h-auto md:flex-[3] border-b md:border-b-0 md:border-r border-gray-300">
        <PDFViewer pdfUrl={currentChat.pdfUrl} />
      </div>

      <div className="flex-1 md:flex-[2] h-[60vh] md:h-auto">
        <div className="h-full overflow-hidden">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
