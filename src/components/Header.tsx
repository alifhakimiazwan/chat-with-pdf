import { Button } from "./ui/button";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import { FileStack } from "lucide-react";
import { Menu } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";

const Header = async () => {
  const { userId } = await auth();
  const isAuth = !!userId;
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link href="#" prefetch={false}>
            <Image
              src="/favicon.svg"
              alt="Logo"
              width={10}
              height={10}
              className="h-10 w-10 rounded-full"
            />
          </Link>
          {/* <div className="grid gap-2 py-6">
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold font-telegraf"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold font-telegraf"
              prefetch={false}
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold font-telegraf"
              prefetch={false}
            >
              About
            </Link>
          </div> */}
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <Link
          href="#"
          className="mr-6 hidden lg:flex items-center gap-2"
          prefetch={false}
        >
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={10}
            height={10}
            className="h-14 w-14 rounded-full"
          />
          <h2 className="text-xl font-bold font-telegraf whitespace-nowrap">
            Chat with PDF
          </h2>
        </Link>
      </div>
      {/* <div className="w-full flex justify-center">
        <NavigationMenu className="hidden  lg:flex">
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link
                href="#"
                className="group inline-flex h-9 w-max items-center font-telegraf justify-center rounded-md bg-white px-4 py-2 text-sm  transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                prefetch={false}
              >
                Features
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                href="#"
                className="group inline-flex h-9 w-max items-center font-telegraf justify-center rounded-md bg-white px-4 py-2 text-sm  transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                prefetch={false}
              >
                Pricing
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                href="#"
                className="group inline-flex h-9 w-max items-center font-telegraf justify-center rounded-md bg-white px-4 py-2 text-sm  transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                prefetch={false}
              >
                About
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
      </div> */}
      <div className="ml-auto flex gap-2 items-center">
        {!isAuth && (
          <>
            <Link href="/sign-in">
              <Button variant="outline">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Create Account</Button>
            </Link>
          </>
        )}
        {isAuth && (
          <div className="flex items-center justify-center w-32 h-32 transform scale-150">
            <UserButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
