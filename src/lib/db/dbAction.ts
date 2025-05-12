import { db } from "@/lib/db";
import { messages as _messages } from "@/lib/db/schema";

export async function saveChat(
  chatId: number,
  content: string,
  role: "user" | "system"
) {
  await db.insert(_messages).values({
    chatId,
    content,
    role,
  });
}
