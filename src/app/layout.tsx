import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProviders";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const telegraf = localFont({
  src: "./fonts/TelegrafRegular.otf",
  variable: "--font-telegraf",
});

export const metadata: Metadata = {
  title: "Chat With PDF",
  description: "Converse with your PDF!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${telegraf.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
