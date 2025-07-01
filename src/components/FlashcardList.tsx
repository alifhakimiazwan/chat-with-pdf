"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Flashcard = {
  id: number;
  front: string;
  back: string;
};
type Chat = {
  id: number;
  pdfName: string;
};

export default function FlashcardList({ chatId }: { chatId: number }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch flashcards
        const flashcardRes = await axios.get("/api/flashcards", {
          params: { chatId },
        });
        setFlashcards(flashcardRes.data);

        // Fetch chat (PDF) info
        const chatRes = await axios.get("/api/chat", {
          params: { chatId },
        });
        setChat(chatRes.data);
        setHasLoaded(true);
      } catch (err) {
        console.error("Failed to fetch flashcards or chat info:", err);
      }
    };
    fetchData();
  }, [chatId]);

  const handleSwipe = (direction: "left" | "right") => {
    setFlipped(false);
    if (direction === "left" && currentIndex < flashcards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleFlip = () => setFlipped((prev) => !prev);
  const isDeckComplete =
    flashcards.length > 0 && currentIndex === flashcards.length;
  const currentCard = flashcards[currentIndex];

  const progressPercent = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="w-full flex flex-col items-center px-4">
      {chat && (
        <div className="text-lg font-semibold text-gray-800 font-telegraf mb-2 text-center max-w-2xl truncate overflow-auto">
          {chat.pdfName.replace(/\.pdf$/i, "")}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-300 rounded-full my-4 max-w-2xl">
        <div
          className="h-2 bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Status bar */}
      <div className="flex justify-center text-sm text-gray-600 w-full max-w-2xl mb-2 px-2">
        {hasLoaded ? (
          <div className="font-semibold font-telegraf text-purple-500">
            {currentIndex === flashcards.length
              ? `${currentIndex} / ${flashcards.length} Flashcards`
              : `${currentIndex + 1} / ${flashcards.length} Flashcards`}
          </div>
        ) : (
          <p className="font-semibold font-telegraf text-purple-500">
            Loading flashcards
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isDeckComplete ? "deck-complete" : currentCard?.id}
          initial={hasLoaded ? { x: 300, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={(_, info) => {
            if (info.offset.x < -100) handleSwipe("left");
            if (info.offset.x > 100) handleSwipe("right");
          }}
          className="w-full max-w-2xl h-72 bg-black text-white border rounded-xl shadow-lg cursor-pointer relative perspective flex items-center justify-center"
        >
          {isDeckComplete ? (
            <div className="flex flex-col items-center space-y-4 font-telegraf text-center">
              <h2 className="text-2xl font-bold">Deck Complete 🎉</h2>
              <p className="text-gray-300">
                Great job! You've finished all the flashcards in this deck.
              </p>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setFlipped(false);
                }}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                Restart Deck
              </button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/chat/${chatId}`)}
                className="mt-3 text-purple-600 border-purple-600 hover:bg-purple-50 font-telegraf"
              >
                ← Back to Chat
              </Button>
            </div>
          ) : (
            <motion.div
              onClick={toggleFlip}
              className={classNames(
                "absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer",
                { "rotate-y-180": flipped }
              )}
            >
              <div className="absolute w-full h-full backface-hidden flex items-center justify-center text-2xl text-center font-bold font-telegraf p-6">
                {currentCard?.front}
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center text-xl p-6 font-telegraf text-center">
                {currentCard?.back}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex justify-between w-full max-w-2xl mt-4 text-sm">
        <button
          onClick={() => handleSwipe("right")}
          disabled={currentIndex === 0}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg shadow disabled:opacity-50 font-telegraf font-semibold"
        >
          ← Previous
        </button>
        <button
          onClick={() => handleSwipe("left")}
          disabled={currentIndex === flashcards.length}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50 font-telegraf font-semibold"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
