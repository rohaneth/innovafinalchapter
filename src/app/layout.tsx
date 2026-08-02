import "./globals.css";
import React from "react";
import { Providers } from "@/components/layout/Providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bias-Aware 360° Review Intelligence System",
  description: "Human-in-the-Loop AI Performance Review Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
