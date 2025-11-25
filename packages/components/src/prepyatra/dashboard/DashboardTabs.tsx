import { Plus } from "lucide-react";
import React, { Suspense } from "react";

import Button from "../../common/Buttons/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Text from "../../common/Typography/Text";
import type { PrepLog } from "@tbe/types";
import type { RecruiterContact } from "@tbe/types";
import type { UserProfile } from "@tbe/interface";
import LoadingSpinner from "../../common/LoadingSpinner";

// Lazy load components
const PrepLogsList = React.lazy(() => import("../features/PrepLogsList"));
const RecruiterContactsTable = React.lazy(() => import("../features/RecruiterContactsTable"));
const ChallengeSection = React.lazy(() => import("../features/ChallengeSection"));
const UserSkillsShowcase = React.lazy(() => import("../showcase/UserSkillsShowcase"));

interface DashboardTabsProps {
    prepLogs: PrepLog[];
    recruiterContacts: RecruiterContact[];
    user?: {
        id?: string;
        name?: string;
        email?: string;
    };
    userProfile?: UserProfile;
    onPrepLogModalOpen: () => void;
    onRecruiterModalOpen: () => void;
    onSkillsModalOpen: () => void;
    onContactUpdated: () => void;
    onLogDeleted: (deletedLogId: string) => void;
    onContactDeleted: (deletedContactId: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
    prepLogs,
    recruiterContacts,
    user,
    userProfile,
    onPrepLogModalOpen,
    onRecruiterModalOpen,
    onSkillsModalOpen,
    onContactUpdated,
    onLogDeleted,
    onContactDeleted
}) => {
    return (
        <Tabs defaultValue="challenges" className="space-y-6">
           <TabsList className="grid w-full gap-2 grid-cols-4">
            <TabsTrigger
                value="challenges"
                className="
                bg-primary text-white
                border-2 border-primary
                transition-all duration-300

                data-[state=active]:bg-white
                data-[state=active]:text-primary
                data-[state=active]:border-primary
                "
            >
                Challenges
            </TabsTrigger>

            <TabsTrigger
                value="prep-logs"
                className="
                bg-primary text-white
                border-2 border-primary
                transition-all duration-300

                data-[state=active]:bg-white
                data-[state=active]:text-primary
                data-[state=active]:border-primary
                "
            >
                Prep Logs
            </TabsTrigger>

            <TabsTrigger
                value="recruiters"
                className="
                bg-primary text-white
                border-2 border-primary
                transition-all duration-300

                data-[state=active]:bg-white
                data-[state=active]:text-primary
                data-[state=active]:border-primary
                "
            >
                Recruiters
            </TabsTrigger>

            <TabsTrigger
                value="skills"
                className="
                bg-primary text-white
                border-2 border-primary
                transition-all duration-300

                data-[state=active]:bg-white
                data-[state=active]:text-primary
                data-[state=active]:border-primary
                "
            >
                Skills
            </TabsTrigger>
            </TabsList>



            <TabsContent value="prep-logs" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div>
                            <Text level="h3" className="text-lg font-semibold">Preparation Logs</Text>
                            <Text level="p" className="text-sm text-muted-foreground">
                                Track your learning progress and preparation journey
                            </Text>
                        </div>
                        <Button 
                            onClick={onPrepLogModalOpen} 
                            variant="PRIMARY"
                            text="Add Log"
                            size="SMALL"
                            icon={<Plus className="w-4 h-4 mr-2" />}
                            className="rounded-1 text-sm px-3 py-1.5"
                        />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Suspense fallback={<LoadingSpinner />}>
                            <PrepLogsList 
                                logs={prepLogs}
                                onLogUpdated={() => {}} 
                                onLogDeleted={onLogDeleted}
                                mongoUserId={user?.id || ""}
                            />
                        </Suspense>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
                <Suspense fallback={<LoadingSpinner />}>
                    <ChallengeSection userId={user?.id || ""} />
                </Suspense>
            </TabsContent>

            <TabsContent value="recruiters" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div>
                            <Text level="h3" className="text-lg font-semibold">Recruiter Contacts</Text>
                            <Text level="p" className="text-sm text-muted-foreground">
                                Manage your network of recruiting professionals
                            </Text>
                        </div>
                        <Button 
                            onClick={onRecruiterModalOpen} 
                            variant="PRIMARY"
                            text="Add Contact"
                            size="SMALL"
                            icon={<Plus className="w-4 h-4 mr-1" />}
                            className="text-sm h-5"
                        />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Suspense fallback={<LoadingSpinner />}>
                            <RecruiterContactsTable
                                contacts={recruiterContacts}
                                onContactUpdated={onContactUpdated}
                                onContactDeleted={onContactDeleted}
                            />
                        </Suspense>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div>
                            <Text level="h3" className="text-lg font-semibold">Skills & Technologies</Text>
                            <Text level="p" className="text-sm text-muted-foreground">
                                Showcase your technical skills and expertise
                            </Text>
                        </div>
                        <Button 
                            onClick={onSkillsModalOpen} 
                            variant="PRIMARY"
                            text="Add Skills"
                            size="SMALL"
                            icon={<Plus className="w-4 h-4 mr-2" />}
                            className="text-sm h-5"
                        />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Suspense fallback={<LoadingSpinner />}>
                            <UserSkillsShowcase 
                                userSkills={userProfile?.userSkills || []}
                                lastUpdated={userProfile?.userSkillsLastUpdated}
                            />
                        </Suspense>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default DashboardTabs;