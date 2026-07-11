import type { Metadata } from "next";
// Use standard font due to next/font/google network fetch issues during build
import "./globals.css";

export const metadata: Metadata = {
  title: "IPO Research Intelligence Platform",
  description:
    "AI-powered IPO research and analysis platform. Generate comprehensive investment reports with multi-agent intelligence.",
  keywords: [
    "IPO",
    "research",
    "intelligence",
    "analysis",
    "investment",
    "AI",
    "data mining",
  ],
  authors: [{ name: "IPO Research Team" }],
  openGraph: {
    title: "IPO Research Intelligence Platform",
    description:
      "AI-powered IPO research and analysis platform for generating comprehensive investment reports.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
