import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechYatra - Your Tech Learning Roadmap",
  description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
  keywords: ["tech learning", "programming", "web development", "dsa", "interview prep", "career guidance"],
  authors: [{ name: "The Boring Education" }],
  openGraph: {
    title: "TechYatra - Your Tech Learning Roadmap",
    description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
    url: "https://techyatra.theboringeducation.com",
    siteName: "TechYatra",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechYatra - Your Tech Learning Roadmap",
    description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

