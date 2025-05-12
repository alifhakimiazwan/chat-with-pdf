"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      defaultTheme="light" // Set default theme to light
      attribute="class" // Uses the class attribute for theme switching
      enableSystem={false} // Disable automatic system theme detection
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
