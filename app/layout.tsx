import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Praharaj DSA Sheet",
  description: "375 DSA questions with company logos, checkboxes and progress tracking.",
  keywords: ["DSA sheet", "data structures", "algorithms", "coding interview questions", "progress tracking"],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Praharaj DSA Sheet",
    description: "Practice 375 data structures and algorithms questions and track your progress.",
    siteName: "Praharaj DSA Sheet",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Praharaj DSA Sheet",
    description: "Practice DSA questions and track your coding interview preparation.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${display.variable} ${body.variable}`}>
        <body>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
