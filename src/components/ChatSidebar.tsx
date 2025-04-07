"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Search,
  MoreVertical,
  Trash2,
  PlusCircle,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import FileUpload from "./FileUpload";

type Props = {
  chats?: DrizzleChat[]; // Make chats optional to prevent undefined errors
  onDeleteChat?: (chatId: number) => void; // Callback for deleting chat
};

const ChatSidebar = ({ chats = [], onDeleteChat }: Props) => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formattedDates, setFormattedDates] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    const dates: Record<number, string> = {};
    chats.forEach((chat) => {
      dates[chat.id] = new Date(chat.createdAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    });
    setFormattedDates(dates);
  }, [chats]);

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        chat.pdfName?.toLowerCase().includes(search.toLowerCase())
      ),
    [chats, search]
  );

  const handleDelete = async (chatId: number) => {
    try {
      await axios.delete(`/api/delete-chat/${chatId}`);

      // Remove the chat from the UI immediately
      if (onDeleteChat) {
        onDeleteChat(chatId);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="w-full mx-3 p-5">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Chats</h1>
          <p className="text-sm text-gray-400">Chat with documents like PDFs</p>
        </div>
        {/* Search Bar */}
        <div className="flex items-center gap-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search chats..."
              className="pl-8 pr-4 py-2 text-gray-600 bg-white border border-black rounded-lg focus:outline-none focus:ring-0 focus:border-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            className="flex items-center gap-x-2"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 "
          onClick={() => setIsModalOpen(false)} // Close modal on clicking outside
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-w-md relative hover:cursor-pointer"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* X Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <h2 className="text-lg font-semibold mb-4 text-center">
              Upload a PDF
            </h2>
            <FileUpload />
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="space-y-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-4 hover:bg-slate-200 transition rounded-lg"
            >
              <Link
                href={`/dashboard/chat/${chat.id}`}
                className="flex items-center gap-4 w-full"
              >
                <MessageCircle className="w-6 h-6 text-zinc-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-500 font-telegraf">
                    {chat.pdfName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Created on {formattedDates[chat.id] || ""}
                  </p>
                </div>
              </Link>
              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDelete(chat.id)}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" /> Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No chats found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
