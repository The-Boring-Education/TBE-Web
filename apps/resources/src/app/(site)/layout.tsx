import { Shell } from "@/components/Shell";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Shell>{children}</Shell>;
}
