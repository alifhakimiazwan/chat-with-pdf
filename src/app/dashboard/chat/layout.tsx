import Sidebar from "@/components/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { chatId?: string }; // Optional to detect chatId
}) {
  return <div>{children}</div>;
}
