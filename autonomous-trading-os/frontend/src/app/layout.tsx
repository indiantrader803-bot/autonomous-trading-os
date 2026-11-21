import "./globals.css";
import React from "react";

export const metadata = {
  title: "Autonomous Trading OS (ATOS)",
  description: "Institutional AI Trading Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
