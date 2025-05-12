"use client";

import { useState } from "react";
import PodcastSidebar from "./PodcastSidebar";
import { PodcastChat } from "@/lib/types";

type Props = {
  initialChats: PodcastChat[];
};

const PodcastClientWrapper = ({ initialChats }: Props) => {
  const [chats, setChats] = useState<PodcastChat[]>(initialChats);

  const handleDeleteChat = (chatId: number) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
  };

  return <PodcastSidebar chats={chats} onDeleteChat={handleDeleteChat} />;
};

export default PodcastClientWrapper;
