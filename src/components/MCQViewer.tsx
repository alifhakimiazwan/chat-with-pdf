"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import MCQ from "@/components/MCQ";

type MCQData = {
  id: number;
  question: string;
  options: string; // stored as string in DB
  correctAnswer: string;
};

export default function MCQViewer({ chatId }: { chatId: number }) {
  const [mcqs, setMcqs] = useState<MCQData[]>([]);

  useEffect(() => {
    const fetchMCQs = async () => {
      const res = await axios.get("/api/mcq", {
        params: { chatId },
      });
      setMcqs(res.data);
    };

    fetchMCQs();
  }, [chatId]);

  return (
    <div className="w-full px-4 space-y-8">
      {mcqs.length === 0 ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <MCQ
          chatId={chatId}
          questions={mcqs.map((mcq) => ({
            question: mcq.question,
            options: JSON.parse(mcq.options),
            correctAnswer: mcq.correctAnswer,
          }))}
        />
      )}
    </div>
  );
}
