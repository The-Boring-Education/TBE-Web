import {Plus} from "lucide-react";
import React, {Suspense} from "react";

import Button from "../../common/Buttons/Button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import type {PrepLog} from "@tbe/types";
import type {RecruiterContact} from "@tbe/types";

// Lazy load components
const PrepLogsList = React.lazy(() => import("../features/PrepLogsList"));
const RecruiterContactsTable = React.lazy(() => import("../features/RecruiterContactsTable"));
const ChallengeSection = React.lazy(() => import("../features/ChallengeSection"));
const UserSkillsShowcase = React.lazy(() => import("../showcase/UserSkillsShowcase"));

interface DashboardTabsProps {
    prepLogs: PrepLog[]
    recruiterContacts: RecruiterContact[]
    user?: {
        id?: string
        name?: string
        email?: string
    }
    profile?: {
        userSkills?: string[]
        userSkillsLastUpdated?: string
        prepYatra?: {
            skills?: string[]
        }
    }
    onPrepLogModalOpen: () => void
    onRecruiterModalOpen: () => void
    onSkillsModalOpen: () => void
    onContactUpdated: () => void
    onLogDeleted: (deletedLogId: string) => void
    onContactDeleted: (deletedContactId: string) => void
}

const ComponentLoader = () => (
    <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
);

const DashboardTabs: React.FC<DashboardTabsProps> = ({
    prepLogs,
    recruiterContacts,
    user,
    profile,
    onPrepLogModalOpen,
    onRecruiterModalOpen,
    onSkillsModalOpen,
    onContactUpdated,
    onLogDeleted,
    onContactDeleted
}) => {
    return (
        <Tabs defaultValue="challenges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="prep-logs">Prep Logs</TabsTrigger>
                <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
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
                        <Suspense fallback={<ComponentLoader />}>
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
                <Suspense fallback={<ComponentLoader />}>
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
                        <Suspense fallback={<ComponentLoader />}>
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
                        <Suspense fallback={<ComponentLoader />}>
                            <UserSkillsShowcase 
                                userSkills={profile?.userSkills || []}
                                lastUpdated={profile?.userSkillsLastUpdated}
                            />
                        </Suspense>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default DashboardTabs;