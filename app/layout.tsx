import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import "./workspace-polish.css";

export const viewport: Viewport = { themeColor: "#000000" };

const display = localFont({
  src: "../public/fonts/bricolage-grotesque.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: "../public/fonts/instrument-sans.woff2",
  weight: "400 700",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Praharaj DSA Sheet",
  description:
    "Your focused workspace for DSA practice. Explore core topics, track your progress, and build a consistent interview preparation routine.",
  keywords: [
    "DSA sheet",
    "data structures",
    "algorithms",
    "coding interview questions",
    "progress tracking",
  ],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Praharaj DSA Sheet",
    description:
      "Practice 375 data structures and algorithms questions and track your progress.",
    siteName: "Praharaj DSA Sheet",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Praharaj DSA Sheet",
    description:
      "Practice DSA questions and track your coding interview preparation.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#96e8ad",
          colorBackground: "#13231a",
          colorForeground: "#eef8ee",
          colorMutedForeground: "#a3bda9",
          colorInput: "#000000",
          colorInputForeground: "#eef8ee",
          colorNeutral: "#eef8ee",
          colorBorder: "#3b5c46",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary: { color: "#112d1b" },
          footerActionLink: { color: "#96e8ad" },
        },
      }}
    >
      <html lang="en" className={`${display.variable} ${body.variable}`}>
        <body>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
