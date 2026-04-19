import {
  DSA_YATRA_SIDEBAR_MENU_BUTTON_CLASS,
  Footer,
  isDashboardSidebarLinkActive,
  LoadingSpinner,
  Navbar,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tbe/components";
import { useUser } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import {
  ClipboardList,
  FileText,
  Home,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { MobileNav } from "./MobileNav";

interface DsaDashboardLayoutProps {
  children: ReactNode;
}

export const DSA_DASHBOARD_SIDEBAR_ITEMS = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Sheets", icon: Target, href: "/sheets" },
  { name: "Revisions", icon: FileText, href: "/revisions" },
  { name: "Topics", icon: ClipboardList, href: "/topics" },
  {
    name: "Progress",
    icon: TrendingUp,
    href: "/dashboard#overall-progress",
  },
];

const DsaDashboardLayout = ({ children }: DsaDashboardLayoutProps) => {
  const router = useRouter();
  const { isAuth, loading } = useUser();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [loading, isAuth, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return (
    <SidebarProvider>
      {/* Sheet sidebar only applies below md in the UI package; we hide the whole
          rail below lg so navigation matches the bottom MobileNav breakpoint. */}
      <div className="max-lg:hidden lg:contents">
        <Sidebar
          className={cn(
            "border-r border-[#222] shadow-[6px_0_32px_rgba(0,0,0,0.32)]",
            "[&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:overflow-hidden",
            "[&_[data-sidebar=sidebar]]:bg-[#101010]",
            "[&_[data-sidebar=sidebar]]:before:pointer-events-none [&_[data-sidebar=sidebar]]:before:absolute [&_[data-sidebar=sidebar]]:before:inset-0",
            "[&_[data-sidebar=sidebar]]:before:bg-[radial-gradient(120%_90%_at_50%_-25%,rgba(255,87,87,0.14),transparent_55%)]",
          )}
        >
          <SidebarContent className="relative z-10 flex flex-col px-3 pb-8 pt-10">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-[#505050]">
                Navigate
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {DSA_DASHBOARD_SIDEBAR_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        isActive={isDashboardSidebarLinkActive(
                          router.pathname,
                          router.asPath,
                          item.href,
                        )}
                        className={DSA_YATRA_SIDEBAR_MENU_BUTTON_CLASS}
                        onClick={() => router.push(item.href)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>

      <SidebarInset className="flex min-h-svh flex-col bg-[#0f0f0f] text-white">
        <Navbar variant="dsayatra" theme="dark" />
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pt-[72px] pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:px-5 lg:px-6 lg:pb-8 lg:pt-[72px] xl:px-8">
          {children}
        </div>

        <div className="relative z-20 mt-auto w-full max-lg:px-0 lg:ml-[calc(-1*var(--sidebar-width))] lg:w-[calc(100%+var(--sidebar-width))]">
          <Footer />
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DsaDashboardLayout;
