"use client";

import { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import { DrizzleChat } from "@/lib/db/schema";

type Props = {
  initialChats: DrizzleChat[];
};

const ChatClientWrapper = ({ initialChats }: Props) => {
  const [chats, setChats] = useState<DrizzleChat[]>(initialChats);

  const handleDeleteChat = (chatId: number) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
  };

  return <ChatSidebar chats={chats} onDeleteChat={handleDeleteChat} />;
};

export default ChatClientWrapper;
