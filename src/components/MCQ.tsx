import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type MCQProps = {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  chatId: number;
};

export default function MCQ({ questions, chatId }: MCQProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (!isSubmitted) setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    if (selected === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelected(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setIsSubmitted(false);
    setIsFinished(false);
  };

  const progress =
    ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100;

  if (isFinished) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 text-center">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold text-purple-700">Quiz Completed!</h2>
          <p className="text-lg font-medium text-gray-800">
            Your score: <span className="font-bold">{score}</span> /{" "}
            {questions.length}
          </p>

          <Button
            onClick={handleRetry}
            className="bg-purple-600 text-white hover:bg-purple-700 w-full"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/chat/${chatId}`)}
            variant="outline"
            className="w-full mt-2 border-gray-400"
          >
            Back to Chat
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Back to Chat Button */}
      <div className="mb-4">
        <Button
          onClick={() => router.push(`/dashboard/chat/${chatId}`)}
          variant="outline"
          className="text-sm text-gray-600"
        >
          ← Back to Chat
        </Button>
      </div>

      <div>
        <Progress value={progress} className="h-2 bg-gray-200 " />
      </div>
      <Card className="w-full p-6">
        <CardContent className="space-y-6">
          <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selected;
              const isWrong = isSelected && !isCorrect;

              let bg = "bg-white";
              let border = "border border-gray-300";
              let text = "text-black";

              if (isSubmitted) {
                if (isCorrect) {
                  bg = "bg-green-100";
                  border = "border-green-500";
                  text = "text-green-700";
                } else if (isWrong) {
                  bg = "bg-red-100";
                  border = "border-red-500";
                  text = "text-red-700";
                }
              } else if (isSelected) {
                bg = "bg-purple-50";
                border = "border-purple-500";
                text = "text-purple-700";
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleSelect(option)}
                  disabled={isSubmitted}
                  variant="outline"
                  className={`w-full h-20 whitespace-normal break-words text-sm ${bg} ${border} ${text}`}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              Next Question
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
