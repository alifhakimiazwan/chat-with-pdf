"use client";
import {
  Settings,
  MessageCircle,
  ListTodoIcon,
  Layers,
  Menu,
  X,
  MicVocal,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Props = {
  isMobile?: boolean;
};

const Sidebar = ({ isMobile }: Props) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the sidebar on link click
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-[calc(100vh-2rem)] p-1 mt-4 mr-3 lg:p-4 lg:m-4 rounded-lg lg:bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-violet-600 via-violet-200 to-slate-100 dark:bg-gray-900 w-64 fixed z-50 lg:static lg:translate-x-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mt-3 pl-3">
          <Image
            src={"/favicon.svg"}
            alt="Chat Logo"
            width={10}
            height={10}
            className="h-10 w-10 rounded-full"
          />
          <h1 className="text-gray-900 dark:text-white text-lg font-extrabold font-telegraf">
            Chat With PDF
          </h1>
        </div>

        {/* Navigation */}
        <div className="mt-6 space-y-2">
          <Link href="/dashboard/chat" onClick={handleLinkClick}>
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <MessageCircle className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Chats
              </p>
            </div>
          </Link>
          <Link href="/dashboard/flashcards" onClick={handleLinkClick}>
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <Layers className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Flashcards
              </p>
            </div>
          </Link>
          <Link href="/dashboard/mcq" onClick={handleLinkClick}>
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <ListTodoIcon className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                MCQs
              </p>
            </div>
          </Link>
          <Link href="/dashboard/podcast" onClick={handleLinkClick}>
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <MicVocal className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Podcasts
              </p>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3">
        <UserButton />
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="p-4 fixed top-4 left-4 z-50 lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && <div className="hidden lg:block">{SidebarContent}</div>}
    </>
  );
};

export default Sidebar;
