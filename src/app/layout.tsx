import type { Metadata } from "next";
import { Playfair_Display, Roboto } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Maestro", template: "%s | Maestro" },
  description: "Site oficial do maestro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${roboto.variable} ${heading.variable} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
