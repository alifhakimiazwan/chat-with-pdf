import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, Volume2 } from "lucide-react";
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { MemoizedMarkdown } from "./MemoizedMarkdown";

type Props = {
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  onTextToSpeech: (text: string) => void;
};

const MessageList = ({ messages, isLoading, isThinking }: Props) => {
  const [currentSpeech, setCurrentSpeech] =
    useState<SpeechSynthesisUtterance | null>(null);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyText = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500); // Reset after 1.5s
    });
  };

  // Handle text-to-speech toggle
  const handleTextToSpeech = (text: string) => {
    if (currentSpeech) {
      window.speechSynthesis.cancel();
      setCurrentSpeech(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
      setCurrentSpeech(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {messages.map((message, index) => {
        return (
          <div
            key={message.id || index}
            className={cn("flex flex-col", {
              "items-end pl-10": message.role === "user",
              "items-start pr-2": message.role === "system",
            })}
          >
            <div
              className={cn(" px-4 py-3 text-sm  flex flex-col gap-2", {
                "rounded-lg shadow-md ring-1 ring-slate-300/10 bg-gray-600 text-white":
                  message.role === "user",
                " text-black": message.role === "system",
              })}
            >
              {message.role === "system" ? (
                <div className="prose prose-sm leading-relaxed max-w-none">
                  <MemoizedMarkdown content={message.content} id={message.id} />
                </div>
              ) : (
                <MemoizedMarkdown content={message.content} id={message.id} />
              )}

              {message.role !== "user" && (
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => handleTextToSpeech(message.content)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyText(message.content, message.id)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-4 h-4 text-zinc-700" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Show typing animation only when AI is generating a response */}
      {isThinking && (
        <div className="flex items-start pr-10">
          <div className="rounded-lg px-4 py-3 text-sm shadow-md ring-1 ring-gray-900/10 bg-gray-100 text-black flex items-center gap-1">
            <span className="w-1 h-1 bg-zinc-800 rounded-full animate-bounce [animation-delay:0s]"></span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
