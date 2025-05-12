"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Message, useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send, Mic, Layers } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import classNames from "classnames";
type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });
  const router = useRouter();
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [isGeneratingMCQ, setIsGeneratingMCQ] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  const { input, handleInputChange, handleSubmit, messages, setInput } =
    useChat({
      api: "/api/chat",
      body: {
        chatId,
        model: selectedModel,
      },
      initialMessages: data || [],
      onResponse: () => {
        setIsThinking(false);
      }, // Hide animation when AI starts responding
    });

  const [isListening, setIsListening] = useState(false);

  const handleSpeechToText = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  // Text-to-Speech (TTS) Functionality
  const handleTextToSpeech = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsThinking(true); // Show three-dot animation immediately
    handleSubmit(event);
  };
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFlashcards = async () => {
    try {
      setIsGenerating(true);

      // Check if flashcards already exist
      const checkRes = await axios.get("/api/flashcards", {
        params: { chatId },
      });

      if (checkRes.data.length > 0) {
        router.push(`/dashboard/flashcards/${chatId}`);
        return;
      }

      // Generate new flashcards
      const response = await axios.post("/api/flashcards", { chatId });
      const data = response.data;

      if (data.success) {
        router.push(`/dashboard/flashcards/${chatId}`);
      } else {
        console.error(
          "❌ Flashcard generation failed:",
          data.error || "Unknown error"
        );
      }
    } catch (error: any) {
      console.error("❌ Flashcard Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleGeneratePodcast = async () => {
    try {
      setIsGeneratingPodcast(true);

      // // Call your podcast generation API
      // const response = await axios.post("/api/podcast", { chatId });
      // const data = response.data;

      // if (data.script) {
      router.push(`/dashboard/podcast/${chatId}`);
      // } else {
      //   console.error(
      //     "❌ Podcast generation failed:",
      //     data.error || "Unknown error"
      //   );
      // }
    } catch (error: any) {
      console.error("❌ Podcast Generation Error:", error);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleGenerateMCQ = async () => {
    try {
      setIsGeneratingMCQ(true);

      // Check if MCQs already exist
      const checkRes = await axios.get("/api/mcq", {
        params: { chatId },
      });

      if (checkRes.data.length > 0) {
        router.push(`/dashboard/mcq/${chatId}`);
        return;
      }

      // Generate new MCQs
      const response = await axios.post("/api/mcq", { chatId });
      const data = response.data;

      if (data.success) {
        router.push(`/dashboard/mcq/${chatId}`);
      } else {
        console.error(
          "❌ MCQ generation failed:",
          data.error || "Unknown error"
        );
      }
    } catch (error: any) {
      console.error("❌ MCQ Generation Error:", error);
    } finally {
      setIsGeneratingMCQ(false);
    }
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 inset-x-2 p-4 bg-white flex justify-between items-center">
        <h3 className="text-xl font-bold font-telegraf">Chat</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="h-8 px-3 py-1 text-xs font-telegraf text-blue-600 border border-blue-500 bg-white hover:bg-blue-50 transition-all flex items-center gap-2 rounded-md disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                Flashcards
              </>
            )}
          </Button>
          <Button
            onClick={handleGenerateMCQ}
            disabled={isGeneratingMCQ}
            className="h-8 px-3 py-1 text-xs font-telegraf text-green-600 border border-green-500 bg-white hover:bg-green-50 transition-all flex items-center gap-2 rounded-md disabled:opacity-50"
          >
            {isGeneratingMCQ ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                MCQs
              </>
            )}
          </Button>
          <Button
            onClick={handleGeneratePodcast}
            disabled={isGeneratingPodcast}
            className="h-8 px-3 py-1 text-xs font-telegraf text-red-600 border border-red-500 bg-white hover:bg-purple-50 transition-all flex items-center gap-2 rounded-md disabled:opacity-50"
          >
            {isGeneratingPodcast ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                Podcast
              </>
            )}
          </Button>
        </div>
      </div>
      <div
        id="message-container"
        className="flex-1 overflow-auto pb-20 px-2" // Extra padding to prevent input overlap
      >
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isThinking={isThinking}
          onTextToSpeech={handleTextToSpeech}
        />
      </div>
      {/* Input form (fixed at bottom) */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 inset-x-0 p-4 bg-white shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />

          {/* Send Button – Purple & Rounded */}
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-full p-3">
            <Send className="h-4 w-4 text-white" />
          </Button>

          {/* Mic Button – Gray Contrast & Pulse */}
          <Button
            type="button"
            onClick={handleSpeechToText}
            className={classNames(
              "bg-purple-50 rounded-full p-3 text-purple-600 border border-purple-500 hover:bg-purple-100 transition-all flex items-center gap-2  disabled:opacity-50 cursor-pointer",
              isListening && "animate-pulse"
            )}
          >
            <Mic className="h-5 w-5 text-purple-500" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
