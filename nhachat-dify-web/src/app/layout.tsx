import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Nha Chat Sommelier | AI Tư vấn Rượu vang",
  description: "Trò chuyện với Sommelier AI để tìm chai vang hoàn hảo cho bữa tiệc của bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-brand-cream text-brand-text text-sm">
        {children}
      </body>
    </html>
  );
}
