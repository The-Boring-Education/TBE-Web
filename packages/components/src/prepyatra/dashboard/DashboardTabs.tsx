import {Plus} from "lucide-react";
import React, {Suspense} from "react";

import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {PrepLog} from "@tbe/types";
import {RecruiterContact} from "@tbe/types";

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
        <Tabs defaultValue="prep-logs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="prep-logs">Prep Logs</TabsTrigger>
                <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="prep-logs" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Preparation Logs</CardTitle>
                            <CardDescription>
                                Track your learning progress and preparation journey
                            </CardDescription>
                        </div>
                        <Button onClick={onPrepLogModalOpen} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Log
                        </Button>
                    </CardHeader>
                    <CardContent>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recruiter Contacts</CardTitle>
                            <CardDescription>
                                Manage your network of recruiting professionals
                            </CardDescription>
                        </div>
                        <Button onClick={onRecruiterModalOpen} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Contact
                        </Button>
                    </CardHeader>
                    <CardContent>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Skills & Technologies</CardTitle>
                            <CardDescription>
                                Showcase your technical skills and expertise
                            </CardDescription>
                        </div>
                        <Button onClick={onSkillsModalOpen} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Skills
                        </Button>
                    </CardHeader>
                    <CardContent>
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