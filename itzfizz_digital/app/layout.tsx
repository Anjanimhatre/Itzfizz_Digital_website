import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ITZFIZZ — Scroll Experience",
  description: "ITZFIZZ — a scroll-driven car animation experience.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${dmSans.variable} scroll-smooth motion-reduce:scroll-auto`}
    >
      <body className="overflow-x-hidden bg-paper font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}