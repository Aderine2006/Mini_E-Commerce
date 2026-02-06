import type { Metadata } from "next";
import "@fontsource/outfit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Store",
  description: "Smart shopping with AI recommendations",
};

import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="container animate-fade-in">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
