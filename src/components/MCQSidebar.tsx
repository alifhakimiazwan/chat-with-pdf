"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Search,
  MoreHorizontal,
  Trash2,
  ListTodoIcon,
  Download,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MCQChat } from "@/lib/types";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Props = {
  chats?: MCQChat[]; // Make chats optional to prevent undefined errors
  onDeleteChat?: (chatId: number) => void; // Callback for deleting chat
};

const MCQSidebar = ({ chats = [], onDeleteChat }: Props) => {
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

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        chat.pdfName?.toLowerCase().includes(search.toLowerCase())
      ),
    [chats, search]
  );

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
      const res = await axios.get("/api/mcq", {
        params: { chatId },
      });

      const mcq = res.data; // Array of { question, options (as string), correctAnswer }

      const doc = new jsPDF();

      // Load logo from public folder
      const logoBase64 = await loadImageAsBase64("/ERY.png");

      // === PAGE 0: Cover ===
      doc.addImage(logoBase64, "PNG", 80, 20, 50, 50); // center top

      doc.setFontSize(20);
      doc.text("Multiple Choice Questions", 105, 80, { align: "center" });

      doc.setFontSize(14);
      doc.text(`From: ${pdfName.replace(/\.pdf$/, "")}`, 105, 90, {
        align: "center",
      });

      const today = new Date().toLocaleDateString("en-MY");
      doc.setFontSize(12);
      doc.text(`Generated on: ${today}`, 105, 100, { align: "center" });

      doc.addPage();

      // === PAGE 1: Questions + Options ===
      doc.setFontSize(12);
      let startY = 20;

      mcq.forEach((item: any, index: number) => {
        const question = `${index + 1}. ${item.question}`;

        let options: string[] = [];
        try {
          options = JSON.parse(item.options);
        } catch (err) {
          console.warn(`Error parsing options for question ${index + 1}`, err);
        }

        // Add question
        doc.text(question, 10, startY);
        startY += 7;

        // Add options
        options.forEach((opt: string, i: number) => {
          const label = String.fromCharCode(65 + i); // A, B, C, D...
          doc.text(`${label}. ${opt}`, 15, startY);
          startY += 6;
        });

        startY += 5;

        // Add new page if content overflows
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
      });

      // === PAGE 2: Answer Key ===
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Answer Key", 105, 20, { align: "center" });

      doc.setFontSize(12);
      let answerY = 30;

      mcq.forEach((item: any, index: number) => {
        doc.text(`${index + 1}. ${item.correctAnswer}`, 10, answerY);
        answerY += 7;

        if (answerY > 280) {
          doc.addPage();
          answerY = 20;
        }
      });

      // Save PDF
      doc.save(`mcq-${chatId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleDelete = async (chatId: number) => {
    try {
      await axios.delete(`/api/mcq/${chatId}`);

      // Remove the chat from the UI immediately
      if (onDeleteChat) {
        onDeleteChat(chatId);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden mx-auto p-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">
            Multiple Choice Questions
          </h1>
          <p className="text-sm text-gray-400">Quiz your PDFs with MCQs!</p>
        </div>
        {/* Search Bar */}
        <div className="flex mt-4 sm:mt-0 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search MCQs..."
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
                  href={`/dashboard/mcq/${chat.chatId}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                      <ListTodoIcon className="w-5 h-5 text-green-600" />
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

export default MCQSidebar;
