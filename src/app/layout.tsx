import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import { Providers } from "@/components/providers";
import { getDefaultSiteTheme } from "@/lib/site-theme";

import "./globals.css";
import { cn } from "@/lib/utils";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Felipe Magalhães", template: "%s | Felipe Magalhães" },
  description: "Site oficial do maestro Felipe Magalhães.",
};

/**
 * Runs before the first paint. `js` lets CSS hide elements that are about to
 * animate in; if the animations have not started 4 seconds later (a script
 * failed to load, for instance) `no-motion` shows everything as it is.
 */
const MOTION_BOOTSTRAP = `(function(){var d=document.documentElement;d.classList.add("js");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.add("no-motion")},4000)})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const defaultTheme = await getDefaultSiteTheme();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", dmSans.variable)}
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input
          dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }}
        />
      </head>
      <body className={`${dmSans.variable} ${heading.variable} min-h-screen`}>
        <Providers defaultTheme={defaultTheme}>{children}</Providers>
      </body>
    </html>
  );
}
