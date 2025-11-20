import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sihirli Masal Atölyesi",
  description: "Çocuğunuza özel yapay zeka destekli masallar oluşturun.",
  manifest: "/manifest.json", // BU SATIRI EKLE
  themeColor: "#fb923c",      // BU SATIRI EKLE (Turuncu tema rengi)
  appleWebApp: {              // BU KISMI EKLE (iPhone uyumluluğu için)
    capable: true,
    statusBarStyle: "default",
    title: "Masalcı",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
