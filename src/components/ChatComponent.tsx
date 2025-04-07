"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Message, useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send, Mic } from "lucide-react";
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
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");

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
        <h3 className="text-xl font-bold">Chat</h3>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      ;{/* Message list (scrollable) */}
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
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={handleSpeechToText}
            className={`bg-gray-600 ${isListening ? "animate-pulse" : ""}`}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
