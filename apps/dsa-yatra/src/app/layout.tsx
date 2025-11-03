import "@/index.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSA Yatra - Master Data Structures & Algorithms",
  description: "Your personalized journey to master Data Structures & Algorithms. By The Boring Education",
  keywords: ["DSA", "Data Structures", "Algorithms", "Programming", "Coding", "Interview Prep"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

