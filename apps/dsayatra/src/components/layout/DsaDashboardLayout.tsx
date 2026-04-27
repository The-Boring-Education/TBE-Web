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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tbe/components";
import { useUser } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { MobileNav } from "@/components/navigation/MobileNav";
import { DSA_DASHBOARD_NAV_ITEMS } from "@/config/dsaDashboardNavItems";

interface DsaDashboardLayoutProps {
  children: ReactNode;
}

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
      <div className="flex items-center justify-center min-h-screen bg-background">
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
            "border-r border-border shadow-sm",
            "[&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:overflow-hidden",
            "[&_[data-sidebar=sidebar]]:bg-background/95",
            "[&_[data-sidebar=sidebar]]:before:pointer-events-none [&_[data-sidebar=sidebar]]:before:absolute [&_[data-sidebar=sidebar]]:before:inset-0",
          )}
        >
          <SidebarContent className="relative z-10 flex flex-col px-3 pb-8 pt-10">
            <SidebarGroup className="py-4">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {DSA_DASHBOARD_NAV_ITEMS.map((item) => (
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
                        {item.icon ? <item.icon className="shrink-0" /> : null}
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

      <SidebarInset className="flex min-h-svh flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar variant="dsayatra" />
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
