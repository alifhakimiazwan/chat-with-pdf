"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlashcardSidebar from "./FlashcardSidebar";
import { FlashcardChat } from "@/lib/types";

type Props = {
  initialChats: FlashcardChat[];
};

const FlashcardClientWrapper = ({ initialChats }: Props) => {
  const [chats, setChats] = useState<FlashcardChat[]>(initialChats);
  const router = useRouter();

  const handleDeleteChat = (chatId: number) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
  };

  return <FlashcardSidebar chats={chats} onDeleteChat={handleDeleteChat} />;
};

export default FlashcardClientWrapper;
