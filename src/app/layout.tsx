import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RGPV Lecture Material Generator",
  description: "Generate syllabus-aligned lecture notes and visual learning material in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-darkText min-h-screen">
        {children}
      </body>
    </html>
  );
}
