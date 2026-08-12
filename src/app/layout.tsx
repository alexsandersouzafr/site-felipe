import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";
import { cn } from "@/lib/utils";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Maestro", template: "%s | Maestro" },
  description: "Site oficial do maestro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", dmSans.variable)}
    >
      <body className={`${dmSans.variable} ${heading.variable} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
