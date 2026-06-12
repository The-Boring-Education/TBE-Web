"use client";

import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import { BarChart3, Home, Trophy } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import SharedNavbar from "../layout/Navbar";
import { useToast } from "./ui/use-toast";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Performance", href: "/performance", icon: BarChart3 },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  const isActive = (href: string) => pathname === href;

  const customActions = navItems.map((item) => (
    <Button
      key={item.name}
      variant={isActive(item.href) ? "PRIMARY" : "GHOST"}
      onClick={() => router.push(item.href)}
      className={`flex items-center gap-2 rounded-md ${
        isActive(item.href)
          ? "bg-primary text-white "
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <item.icon className="h-4 w-4" />
      <span className="hidden sm:inline">{item.name}</span>
    </Button>
  ));

  return (
    <SharedNavbar
      userId={user?.id}
      onSignOut={handleSignOut}
      variant="quizes"
      customActions={user ? customActions : undefined}
      theme="light"
      profileRoute="/profile"
    />
  );
}
