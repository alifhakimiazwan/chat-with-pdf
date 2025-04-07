"use client";
import { FileText, Settings, MessageCircleCode } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "next-themes";

const Sidebar = () => {
  const { theme } = useTheme(); // Get current theme

  return (
    <div className="w-full h-screen p-4 flex flex-col justify-between bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-violet-600 via-violet-200 to-slate-100 dark:bg-gray-900">
      {/* Top Section: Logo & Title */}
      <div>
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

        {/* Separator */}
        <div className="border-b border-gray-300 dark:border-gray-700 my-6" />

        {/* Other Sections */}
        <div className="mt-6 space-y-2">
          <Link href="/dashboard/chat">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <MessageCircleCode className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium  text-gray-900 dark:text-white">
                Chats
              </p>
            </div>
          </Link>

          <Link href="/dashboard/documents">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <FileText className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium  text-gray-900 dark:text-white">
                Documents
              </p>
            </div>
          </Link>

          <Link href="/dashboard/settings">
            <div className="flex items-center gap-2 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
              <Settings className="w-5 h-5" />
              <p className="text-md font-telegraf font-medium  text-gray-900 dark:text-white">
                Settings
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="flex items-center gap-3 p-3 ">
        <ThemeToggle />
        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;
