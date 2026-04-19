import {
  APP_DASHBOARD_SIDEBAR_BUTTON_CLASS,
  Footer,
  isDashboardSidebarLinkActive,
  LoadingSpinner,
  Navbar,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@tbe/components";
import { useUser } from "@tbe/hooks";
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

const DashboardSidebarMenu = () => {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {DSA_DASHBOARD_SIDEBAR_ITEMS.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton
            isActive={isDashboardSidebarLinkActive(
              router.pathname,
              router.asPath,
              item.href,
            )}
            className={APP_DASHBOARD_SIDEBAR_BUTTON_CLASS}
            onClick={() => {
              router.push(item.href);
              setOpenMobile(false);
            }}
          >
            {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
            <span className="ml-2">{item.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

const MobileSidebarFlag = () => {
  const { openMobile } = useSidebar();

  // Hide flag when the sidebar is actively opened
  if (openMobile) return null;

  return (
    <div className="md:hidden fixed left-0 top-[25%] -translate-y-1/2 z-[100]">
      <SidebarTrigger className="bg-[#2a2a2a] text-[#ff5757] border border-l-0 border-[#3a3a3a] rounded-none rounded-r-xl shadow-[4px_0_15px_rgba(0,0,0,0.5)] hover:bg-[#333] w-9 h-14 transition-all opacity-80 hover:opacity-100 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5" />
    </div>
  );
};

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
      <Sidebar className="border-r border-gray-800">
        <SidebarContent className="pt-10 h-full bg-[#0A0A0A] z-40">
          <DashboardSidebarMenu />
        </SidebarContent>
      </Sidebar>

      {/* Fixed Mobile Sidebar Flag */}
      <MobileSidebarFlag />

      <SidebarInset className="bg-[#0A0A0A] flex flex-col w-full overflow-hidden">
        <Navbar variant="dsayatra" theme="dark" />

        <main className="flex-1 pt-24 pb-6 px-4 md:pt-24 md:pb-16 md:px-8 space-y-6">
          {children}
        </main>

        <div
          className="relative"
          style={{
            marginLeft: "calc(var(--sidebar-width) * -1)",
            width: "calc(100% + var(--sidebar-width))",
            zIndex: 20,
          }}
        >
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DsaDashboardLayout;
