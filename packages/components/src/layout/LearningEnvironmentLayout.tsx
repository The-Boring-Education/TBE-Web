import { Dialog, Transition } from "@headlessui/react";
import type { ReactNode } from "react";
import { Fragment, useState } from "react";

import { FlexContainer, LearningSidebarPanel, LoadingSpinner, Text } from "..";
import { useColorTheme, useHasThemeProvider } from "../common/Theme";
import LearningNavbar from "./LearningNavbar";

export interface LearningEnvironmentLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  backHref: string;
  isLoading?: boolean;
  layoutMode?: "centered" | "workspace";
  headerCenterContent?: ReactNode;
  showGamification?: boolean;
  totalItems?: number;
  completedItems?: number;
}

const LearningEnvironmentLayout = ({
  children,
  sidebarContent,
  backHref,
  isLoading = false,
  layoutMode = "centered",
  headerCenterContent,
  showGamification = true,
  totalItems = 0,
  completedItems = 0,
}: LearningEnvironmentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasThemeProvider = useHasThemeProvider();
  const colorTheme = useColorTheme();
  // Preserve prior dark learning chrome when no ThemeProvider is present.
  const sidebarTheme = hasThemeProvider ? colorTheme : "dark";

  return (
    <div
      className={`flex flex-col bg-background text-foreground ${layoutMode === "workspace" ? "min-h-screen md:h-screen md:overflow-hidden" : "min-h-screen"}`}
    >
      {/* Top Navbar */}
      <LearningNavbar
        backHref={backHref}
        onMenuToggle={sidebarContent ? () => setSidebarOpen(true) : undefined}
        headerCenterContent={headerCenterContent}
        showGamification={showGamification}
      />

      <div
        className={`flex-1 flex flex-col ${layoutMode === "workspace" ? "pt-[72px] min-h-0" : "pt-[72px]"}`}
      >
        {isLoading ? (
          <FlexContainer className="flex-1 items-center justify-center">
            <LoadingSpinner />
            <Text level="p" className="mt-4 text-muted-foreground">
              Loading environment...
            </Text>
          </FlexContainer>
        ) : (
          children
        )}
      </div>

      {/* Mobile Sidebar */}
      {sidebarContent && (
        <Transition.Root as={Fragment} show={sidebarOpen}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-[380px] max-w-md bg-card text-foreground border-r border-border">
                  <LearningSidebarPanel
                    title="Questions"
                    totalItems={totalItems}
                    completedItems={completedItems}
                    theme={sidebarTheme}
                    onClose={() => setSidebarOpen(false)}
                  >
                    {sidebarContent}
                  </LearningSidebarPanel>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </div>
  );
};

export default LearningEnvironmentLayout;
