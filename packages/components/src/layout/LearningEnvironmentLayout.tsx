import { ReactNode, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LoadingSpinner, Text, FlexContainer, LearningSidebarPanel } from '..';
import LearningNavbar from './LearningNavbar';

export interface LearningEnvironmentLayoutProps {
    children: ReactNode;
    sidebarContent?: ReactNode;
    backHref: string;
    isLoading?: boolean;
    layoutMode?: 'centered' | 'workspace';
    headerCenterContent?: ReactNode;
    headerRightContent?: ReactNode;
    totalItems?: number;
    completedItems?: number;
}

const LearningEnvironmentLayout = ({
    children,
    sidebarContent,
    backHref,
    isLoading = false,
    layoutMode = 'centered',
    headerCenterContent,
    headerRightContent,
    totalItems = 0,
    completedItems = 0
}: LearningEnvironmentLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`flex flex-col bg-black text-white ${layoutMode === 'workspace' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            {/* Top Navbar */}
            <LearningNavbar
                backHref={backHref}
                onMenuToggle={sidebarContent ? () => setSidebarOpen(true) : undefined}
                headerCenterContent={headerCenterContent}
                headerRightContent={headerRightContent}
            />

            {/* Main Content Area */}
            <main className="flex-1 min-h-0 w-full pt-[72px] flex flex-col items-center">
                {isLoading ? (
                    <div className="flex flex-col h-full min-h-[60vh] w-full items-center justify-center">
                        <LoadingSpinner height={8} width={8} />
                        <Text level="p" className="mt-4 text-gray-400">Loading environment...</Text>
                    </div>
                ) : (
                    layoutMode === 'centered' ? (
                        <FlexContainer
                            className="w-full max-w-[1000px] shrink-0 mx-auto px-4 py-6 gap-4"
                            itemCenter={false}
                            justifyCenter={false}
                        >
                            <div className="w-full h-full">
                                {children}
                            </div>
                        </FlexContainer>
                    ) : (
                        /* Workspace Mode (e.g. DSA Split Panes) - Full height minus navbar */
                        <div className="flex-1 w-full flex flex-col min-h-0">
                            {children}
                        </div>
                    )
                )}
            </main>

            {/* Slide-out Sidebar Drawer for Mobile & Desktop */}
            {sidebarContent && (
                <Transition show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="transform transition ease-in-out duration-200"
                                        enterFrom="-translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transform transition ease-in-out duration-150"
                                        leaveFrom="translate-x-0"
                                        leaveTo="-translate-x-full"
                                    >
                                        <Dialog.Panel className="pointer-events-auto w-[380px] max-w-md bg-[#111111] text-white">
                                            <LearningSidebarPanel
                                                title="Questions"
                                                totalItems={totalItems}
                                                completedItems={completedItems}
                                                theme="dark"
                                                onClose={() => setSidebarOpen(false)}
                                            >
                                                {sidebarContent}
                                            </LearningSidebarPanel>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </div>
    );
};

export default LearningEnvironmentLayout;
