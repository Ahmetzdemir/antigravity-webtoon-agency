import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Antigravity Webtoon Agency | Premium AI Translation",
  description: "Next-gen AI powered Webtoon and Manhwa translation agency service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;700&family=Comic+Neue:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-accent/30">
        {children}
      </body>
    </html>
  );
}
