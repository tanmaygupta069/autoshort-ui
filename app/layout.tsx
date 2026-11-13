import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixelBody = Pixelify_Sans({ variable: "--font-pixel-body", subsets: ["latin"] });
const pixelDisplay = Press_Start_2P({ variable: "--font-pixel-display", subsets: ["latin"], weight: "400" });
const pixelMono = VT323({ variable: "--font-pixel-mono", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "AutoShort",
  description: "Review research ideas and produced reels",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#14102a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pixelBody.variable} ${pixelDisplay.variable} ${pixelMono.variable} h-full `}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
