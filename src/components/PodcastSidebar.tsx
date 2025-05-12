"use client";

import { useRouter } from "next/navigation";
import {
  Trash2,
  Music,
  MessageCircle,
  Search,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";

type PodcastChat = {
  chatId: number;
  pdfName: string;
  createdAt: string;
};

type Props = {
  chats: PodcastChat[];
  onDeleteChat: (chatId: number) => void;
};

const PodcastSidebar = ({ chats, onDeleteChat }: Props) => {
  const router = useRouter();

  // State for search input
  const [search, setSearch] = useState<string>("");

  // Memoized formatted dates to improve performance
  const formattedDates = useMemo(() => {
    return chats.reduce((acc, chat) => {
      const date = new Date(chat.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      acc[chat.chatId] = date;
      return acc;
    }, {} as Record<number, string>);
  }, [chats]);

  // Filtered chats based on search input
  const filteredChats = useMemo(() => {
    if (!search) return chats;
    return chats.filter((chat) =>
      chat.pdfName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, chats]);

  const handleDelete = (chatId: number) => {
    onDeleteChat(chatId);
  };

  const handleNavigate = (chatId: number) => {
    router.push(`/dashboard/podcast/${chatId}`);
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden mx-auto p-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Podcasts</h1>
          <p className="text-sm text-gray-400">
            Listen to your PDFs as podcasts!
          </p>
        </div>
        {/* Search Bar */}
        <div className="flex mt-4 sm:mt-0 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search podcasts..."
              className="pl-8 pr-4 py-2 text-gray-600 bg-white border placeholder:text-sm rounded-full shadow-sm focus:outline-none focus:ring-0 focus:ring-purple-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Podcast List */}
      <div className="space-y-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className="flex items-center justify-between p-4 hover:bg-slate-200 transition rounded-lg"
            >
              <Link
                href={`/dashboard/podcast/${chat.chatId}`}
                className="flex items-center gap-4 w-full"
              >
                <div className="hidden sm:block">
                  <Music className="w-6 h-6 text-zinc-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-500 font-telegraf truncate max-w-[220px] sm:max-w-sm">
                    {chat.pdfName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Created on {formattedDates[chat.chatId] || ""}
                  </p>
                </div>
              </Link>
              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDelete(chat.chatId)}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" /> Delete
                    Podcast
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No podcasts found.</p>
        )}
      </div>
    </div>
  );
};

export default PodcastSidebar;
