"use client";
import {
  Settings,
  MessageCircle,
  ListTodoIcon,
  Layers,
  Menu,
  X,
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

  const SidebarContent = (
    <div className="flex flex-col justify-between h-[calc(100vh-2rem)] p-4 m-4 rounded-lg bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-violet-600 via-violet-200 to-slate-100 dark:bg-gray-900 w-64 fixed z-50 lg:static lg:translate-x-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mt-3">
          <Image
            src={
              theme === "dark"
                ? "/logo/ChatLogoWhite.svg"
                : "/logo/ChatLogoBlack.svg"
            }
            alt="Chat Logo"
            width={30}
            height={30}
          />
          <h1 className="text-gray-900 dark:text-white text-lg font-extrabold font-telegraf">
            Chat With PDF
          </h1>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700 my-6" />

        {/* Navigation */}
        <div className="mt-6 space-y-2">
          <Link href="/dashboard/chat">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <MessageCircle className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Chats
              </p>
            </div>
          </Link>
          <Link href="/dashboard/flashcards">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <Layers className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Flashcards
              </p>
            </div>
          </Link>
          <Link href="/dashboard/mcq">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <ListTodoIcon className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                MCQs
              </p>
            </div>
          </Link>
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <Settings className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium text-gray-900 dark:text-white">
                Settings
              </p>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3">
        <ThemeToggle />
        <UserButton />
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-4 fixed top-4 left-4 z-50lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && SidebarContent}
    </>
  );
};

export default Sidebar;
