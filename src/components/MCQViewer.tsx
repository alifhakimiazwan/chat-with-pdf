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
    <div className="space-y-8 px-4 max-w-2xl mx-auto">
      {mcqs.length === 0 ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        mcqs.map((mcq) => (
          <MCQ
            key={mcq.id}
            question={mcq.question}
            options={JSON.parse(mcq.options)}
            correctAnswer={mcq.correctAnswer}
          />
        ))
      )}
    </div>
  );
}
