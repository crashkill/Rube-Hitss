'use client';
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";
import { ThemeScript } from "./context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const flecha = Crimson_Text({
  variable: "--font-flecha",
  subsets: ["latin"],
  weight: ["600", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Rube</title>
        <meta name="description" content="Get something done today" />
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${flecha.variable} font-inter antialiased`} suppressHydrationWarning>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
