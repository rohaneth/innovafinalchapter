import "./globals.css";
import React from "react";
import { Providers } from "@/components/layout/Providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
