import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Apex Clean",
  description: "AI-powered drug detection dashboard",
  icons: {
    icon: [
      { url: "/shield-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/shield-logo.svg", "/favicon.ico"],
    apple: ["/shield-logo.svg", "/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
