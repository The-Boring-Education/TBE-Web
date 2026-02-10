import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Providers } from "./providers";

// Safely get base URL - always return a valid URL
const getMetadataBase = (): URL => {
  const baseUrl = "https://techyatra.theboringeducation.com";
  try {
    return new URL(baseUrl);
  } catch (error) {
    // Fallback to a guaranteed valid URL
    return new URL("https://techyatra.theboringeducation.com");
  }
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "TechYatra - Your Tech Learning Roadmap",
  description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
  keywords: ["tech learning", "programming", "web development", "dsa", "interview prep", "career guidance"],
  authors: [{ name: "The Boring Education" }],
  openGraph: {
    title: "TechYatra - Your Tech Learning Roadmap",
    description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
    siteName: "TechYatra",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechYatra - Your Tech Learning Roadmap",
    description: "Get personalized learning paths based on your interests and goals. Start your tech journey here!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

