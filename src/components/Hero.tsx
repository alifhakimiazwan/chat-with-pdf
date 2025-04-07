import { auth } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import FileUpload from "./FileUpload";
import Header from "./Header";
import DashboardButton from "./DashboardButton";

export default async function Hero() {
  const { userId } = await auth();
  const isAuth = !!userId;
  return (
    <>
      <div className="px-7">
        {" "}
        <Header />
        {/* Hero */}
        <div className="relative overflow-hidden py-18 lg:py-15 lg:pl-20 md:px-5">
          {/* Gradients */}
          <div
            aria-hidden="true"
            className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
          >
            <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
            <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
          </div>
          {/* End Gradients */}
          <div className="relative z-10">
            <div className="container py-4 lg:py-16">
              <div className="max-w-2xl text-center mx-auto">
                <p className="">Ask your PDF anything!</p>
                {/* Title */}
                <div className="mt-5 max-w-2xl">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Chat With PDF
                  </h1>
                </div>
                {/* End Title */}
                <div className="mt-5 max-w-3xl">
                  <p className="text-md text-muted-foreground ">
                    Join millions of students to instantly answer questions and
                    understand your PDF with AI. Click get started to upload
                    your PDF for free.
                  </p>
                </div>
                {/* Buttons */}
                <div className="mt-8 flex justify-center">
                  {!isAuth && (
                    <Link href="/sign-in">
                      <Button size={"lg"}>
                        Get started <LogIn />
                      </Button>
                    </Link>
                  )}
                  {isAuth && (
                    <>
                      <div className="flex-col">
                        <DashboardButton userId={userId} />
                        <FileUpload />
                      </div>
                    </>
                  )}
                </div>
                {/* End Buttons */}
              </div>
            </div>
          </div>
        </div>
        {/* End Hero */}
      </div>
    </>
  );
}
