import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const panton = localFont({
  variable: "--font-panton",
  display: "swap",
  src: [
    {
      path: "../public/fonts/panton/Panton-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/panton/Panton-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/panton/Panton-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/panton/Panton-SemiBoldItalic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/panton/Panton-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/panton/Panton-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  title: "nimblecare",
  description: "Digital triage",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${panton.variable} h-full antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden">{children}</body>
    </html>
  );
}
