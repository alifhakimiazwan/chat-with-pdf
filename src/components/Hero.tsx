import { auth } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import FileUpload from "./FileUpload";
import Header from "./Header";
import DashboardButton from "./DashboardButton";
import Image from "next/image";

export default async function Hero() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div>
      {/* Header (no dotted background) */}
      <Header />

      {/* Hero Section with dotted background */}
      <div className="bg-dots min-h-[calc(100vh-5rem)] px-4 flex justify-center items-center border-t mx-3 pb-4 mb-3 rounded-lg border border-gray-200">
        <div className=" py-20 px-4 md:px-8 w-full max-w-7xl mx-auto text-center ">
          <div className="relative">
            <Image
              src="/todolist.png"
              alt="Top Right"
              width={300}
              height={300}
              className=" hidden md:block absolute -top-20 -left-20 rounded-xl -rotate-6"
            />
            <Image
              src="/chat.png"
              alt="Top Left"
              width={200} // ⬅️ Increase this
              height={200} // ⬅️ And this
              className="hidden md:block absolute top-24 -left-3 m-4  rounded-xl shadow-md rotate-6 "
            />

            <Image
              src="/flashc.svg"
              alt="Top Right"
              width={300}
              height={300}
              className="hidden md:block absolute -top-20 -right-20 rounded-xl rotate-6"
            />
          </div>

          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
            <Image
              src="/favicon.svg"
              alt="Logo"
              width={50}
              height={50}
              className="h-24 w-24"
            />

            <div className="mt-6">
              <h1 className="text-4xl sm:text-4xl lg:text-7xl xl:text-7xl font-bold font-telegraf">
                Read, ask and learn
              </h1>
              <h1 className="text-4xl sm:text-3xl lg:text-5xl text-gray-400 mt-1 font-telegraf font-semibold">
                all from your PDF
              </h1>
            </div>

            <p className="mt-6 max-w-2xl text-md text-muted-foreground font-telegraf">
              Efficiently manage your study materials, generate MCQs, and
              enhance your learning experience with AI.
            </p>

            <div className="mt-8 flex justify-center">
              {!isAuth ? (
                <Link href="/sign-in">
                  <Button size="lg">
                    Get started <LogIn />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-4 font-telegraf ">
                  <DashboardButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
