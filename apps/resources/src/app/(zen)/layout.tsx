export default function ZenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--shell-bg)] text-[var(--shell-fg)]">
      <main className="relative z-10">{children}</main>
    </div>
  );
}
