"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  Trash2,
  Layers3,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FlashcardChat } from "@/lib/types";

type Props = {
  chats?: FlashcardChat[];
  onDeleteChat?: (chatId: number) => void;
};

const FlashcardSidebar = ({ chats = [], onDeleteChat }: Props) => {
  const [search, setSearch] = useState("");
  const [formattedDates, setFormattedDates] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    const dates: Record<number, string> = {};
    chats.forEach((chat) => {
      dates[chat.chatId] = new Date(chat.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        }
      );
    });
    setFormattedDates(dates);
  }, [chats]);

  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // needed if hosted
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async (chatId: number, pdfName: string) => {
    try {
      const res = await axios.get("/api/flashcards", {
        params: { chatId },
      });

      const flashcards = res.data;
      const doc = new jsPDF();

      // Load logo from public folder
      const logoBase64 = await loadImageAsBase64("/ERY.png");

      // Add Logo
      doc.addImage(logoBase64, "PNG", 80, 20, 50, 50); // center top

      // Title & meta
      doc.setFontSize(20);
      doc.text("Flashcards Deck", 105, 80, { align: "center" });

      doc.setFontSize(14);
      doc.text(`From: ${pdfName.replace(/\.pdf$/, "")}`, 105, 90, {
        align: "center",
      });

      const today = new Date().toLocaleDateString("en-MY");
      doc.setFontSize(12);
      doc.text(`Generated on: ${today}`, 105, 100, { align: "center" });

      doc.addPage();

      // Table content
      const rows = flashcards.map((card: any, idx: number) => [
        `Q${idx + 1}: ${card.front}`,
        `A${idx + 1}: ${card.back}`,
      ]);

      autoTable(doc, {
        head: [["Question", "Answer"]],
        body: rows,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 },
        },
        headStyles: {
          fillColor: [138, 43, 226],
          textColor: [255, 255, 255],
          halign: "center",
        },
        margin: { top: 10, left: 10, right: 10 },
      });

      doc.save(`flashcards-${chatId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        chat.pdfName?.toLowerCase().includes(search.toLowerCase())
      ),
    [chats, search]
  );

  const handleDelete = async (chatId: number) => {
    try {
      await axios.delete(`/api/flashcard/${chatId}`);
      if (onDeleteChat) onDeleteChat(chatId);
    } catch (error) {
      console.error("Failed to delete flashcard set:", error);
    }
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden mx-auto p-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Flashcards</h1>
          <p className="text-sm text-gray-400">
            Study your PDFs with flashcards!
          </p>
        </div>
        {/* Search Bar */}
        <div className="flex mt-4 sm:mt-0 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search flashcards..."
              className="pl-8 pr-4 py-2 text-gray-600 bg-white border placeholder:text-sm rounded-full shadow-sm focus:outline-none focus:ring-0 focus:ring-purple-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Flashcard List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <Card
              key={chat.chatId}
              className="hover:shadow-md transition w-full"
            >
              <CardContent className="p-4 space-y-2">
                <Link
                  href={`/dashboard/flashcards/${chat.chatId}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-purple-100 p-2 rounded-full">
                      <Layers3 className="w-5 h-5 text-purple-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-800 font-telegraf truncate">
                        {chat.pdfName.replace(/\.pdf$/i, "")}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        Created on {formattedDates[chat.chatId] || ""}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Dots Menu */}
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="w-5 h-5 text-gray-600 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownload(chat.chatId, chat.pdfName)
                        }
                        className="cursor-pointer"
                      >
                        <Download className="w-4 h-4 mr-2 text-purple-600" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(chat.chatId)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                        Delete Flashcards
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-400 text-center">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default FlashcardSidebar;
