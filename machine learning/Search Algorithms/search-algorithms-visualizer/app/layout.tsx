import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Search Algorithms Visualizer",
  description: "Interactive visualizer for informed and uninformed search algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

