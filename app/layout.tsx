import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

import { AppProviders } from "@/app/providers";
import "@/app/styles/globals.css";

const headline = Hanken_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const label = JetBrains_Mono({
  variable: "--font-label",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventPro",
  description: "Plataforma de gestión de eventos",
};

const THEME_INIT = `(function(){try{var t=localStorage.getItem("eventpro.theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${headline.variable} ${body.variable} ${label.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
