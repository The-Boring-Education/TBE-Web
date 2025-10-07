import {ExternalLink, Github, Linkedin, Edit, Copy} from "lucide-react";
import {useRouter} from "next/router";
import React from "react";
import {toast} from "sonner";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button, Text, FlexContainer} from "@tbe/components";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

interface Profile {
    _id?: string
    name?: string
    userName?: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    image?: string
    userSkills?: string[]
    userSkillsLastUpdated?: string
    prepYatra?: {
        experienceLevel?: string
        goal?: string
        skills?: string[]
        targetCompanies?: string[]
        preferences?: {
            focusAreas?: string[]
            interviewCategories?: string[]
        }
    }
    createdAt?: string
    occupation?: string
    purpose?: string[]
}

interface User {
    name?: string
    picture?: string
    id?: string
}

interface ProfileSectionProps {
    user?: User
    profile?: Profile
    onEditClick?: () => void
}

const withProtocol = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
};

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const ProfileSection: React.FC<ProfileSectionProps> = ({user, profile, onEditClick}) => {
    const router = useRouter();

    const handleViewJourneyClick = () => {
        router.push(`/journey/${profile?.userName}`);
    };

    const handleShareJourneyClick = async () => {
        if (profile?.userName) {
            const journeyUrl = `${window.location.origin}/journey/${profile.userName}`;
            try {
                await navigator.clipboard.writeText(journeyUrl);
                toast.success("Journey URL copied to clipboard!");
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = journeyUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                toast.success("Journey URL copied to clipboard!");
            }
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={profile?.image || user?.picture} alt={profile?.name || user?.name} />
                    <AvatarFallback className="text-lg">
                        {getInitials(profile?.name || user?.name || "")}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                    {profile?.name || user?.name}
                </CardTitle>
                <CardDescription>
                    @{profile?.userName || user?.name?.toLowerCase()}
                </CardDescription>

                {/* Social Links */}
                <FlexContainer className="justify-center space-x-3 mt-4">
                    {profile?.linkedInUrl && (
                        <a
                            href={withProtocol(profile.linkedInUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                        >
                            <Linkedin className="w-4 h-4 text-white" />
                        </a>
                    )}
                    {profile?.githubUrl && (
                        <a
                            href={withProtocol(profile.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                        >
                            <Github className="w-4 h-4 text-white" />
                        </a>
                    )}
                    {profile?.leetCodeUrl && (
                        <a
                            href={withProtocol(profile.leetCodeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                        >
                            <ExternalLink className="w-4 h-4 text-white" />
                        </a>
                    )}
                </FlexContainer>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Experience:</span>
                        <Badge variant="secondary">
                            {profile?.prepYatra?.experienceLevel || "Not set"}
                        </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Goal:</span>
                        <Badge variant="outline">
                            {profile?.prepYatra?.goal || "Not set"}
                        </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Occupation:</span>
                        <span>
                            {profile?.occupation ? profile.occupation.replace("_", " ") : "Not set"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Purpose:</span>
                        <span>
                            {profile?.purpose && profile.purpose.length > 0 
                                ? profile.purpose.map(p => p.replace("_", " ")).join(", ")
                                : "Not set"
                            }
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Joined:</span>
                        <span>
                            {profile?.createdAt 
                                ? new Date(profile.createdAt).toLocaleDateString()
                                : "Unknown"
                            }
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <FlexContainer direction="col" className="gap-3 mt-6">
                    {onEditClick && (
                        <Button
                            text="Edit Onboarding Details"
                            onClick={onEditClick}
                            variant="PRIMARY"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                            icon={<Edit className="w-4 h-4 mr-2" />}
                        />
                    )}
                    {profile?.userName && (
                        <Button
                            text="Share Your Journey"
                            onClick={handleShareJourneyClick}
                            variant="OUTLINE"
                            className="bg-white hover:bg-gray-100 text-black font-medium border-gray-300"
                            icon={<Copy className="w-4 h-4 mr-2" />}
                        />
                    )}
                </FlexContainer>
            </CardContent>
        </Card>
    );
};

export default ProfileSection;