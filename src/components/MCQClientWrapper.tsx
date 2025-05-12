"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MCQSidebar from "./MCQSidebar";
import { MCQChat } from "@/lib/types";
type Props = {
  initialChats: MCQChat[];
};

const MCQClientWrapper = ({ initialChats }: Props) => {
  const [chats, setChats] = useState<MCQChat[]>(initialChats);
  const router = useRouter();

  const handleDeleteChat = (chatId: number) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
  };

  return <MCQSidebar chats={chats} onDeleteChat={handleDeleteChat} />;
};

export default MCQClientWrapper;
