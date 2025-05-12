"use client";

import { useState } from "react";

type MCQProps = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function MCQ({ question, options, correctAnswer }: MCQProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (option: string) => {
    if (!isSubmitted) setSelected(option);
  };

  const handleSubmit = () => {
    if (selected) setIsSubmitted(true);
  };

  return (
    <div className="border p-6 rounded-xl shadow-md space-y-4 bg-white">
      <h2 className="text-lg font-bold">{question}</h2>

      <div className="space-y-2">
        {options.map((option, index) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selected;

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-2 rounded-lg border transition 
                ${
                  isSubmitted
                    ? isCorrect
                      ? "bg-green-100 border-green-500 text-green-700"
                      : isSelected
                      ? "bg-red-100 border-red-500 text-red-700"
                      : "bg-white"
                    : isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 bg-white"
                }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || isSubmitted}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-semibold"
      >
        Submit Answer
      </button>
    </div>
  );
}
