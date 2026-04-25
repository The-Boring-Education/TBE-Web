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
import { usePaymentStatus, useUser } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { ONCAMPUS_DASHBOARD_NAV_ITEMS } from "@/config/oncampusDashboardNavItems";

import { MobileNav } from "./MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, isAuth, loading } = useUser();

  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: "oncampus",
    productType: "ONCAMPUS",
    isPremium: true,
  });

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
      {/* Rail hidden below lg to match bottom MobileNav breakpoint (same as DSA Yatra). */}
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
            <SidebarGroup className="py-4">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {ONCAMPUS_DASHBOARD_NAV_ITEMS.map((item) => (
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

      <SidebarInset className="flex min-h-svh flex-col bg-[#0f0f0f] text-white">
        <Navbar
          variant="oncampus"
          theme="dark"
          hidePricingLink={isPurchased === true}
        />
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pt-[72px] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:px-5 lg:px-6 lg:pb-8 lg:pt-[72px] xl:px-8">
          {children}
        </div>

        <div className="relative z-20 mt-auto w-full max-lg:px-0 lg:ml-[calc(-1*var(--sidebar-width))] lg:w-[calc(100%+var(--sidebar-width))]">
          <Footer variant="oncampus" />
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
