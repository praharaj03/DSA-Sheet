import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

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
          colorPrimary: "#c3ed98",
          colorBackground: "#181c19",
          colorForeground: "#edf1e9",
          colorMutedForeground: "#a1aca0",
          colorInput: "#101311",
          colorInputForeground: "#edf1e9",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary: { color: "#1d2a16" },
          footerActionLink: { color: "#c3ed98" },
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
