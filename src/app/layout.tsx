import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { EvalProvider } from "@/context/EvalContext";
import { CurateProvider } from "@/context/CurateContext";
import { AppModeProvider } from "@/context/AppModeContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Review Tool",
  description: "Review AI evaluation data and curate prompt examples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AppModeProvider>
          <EvalProvider>
            <CurateProvider>{children}</CurateProvider>
          </EvalProvider>
        </AppModeProvider>
      </body>
    </html>
  );
}
