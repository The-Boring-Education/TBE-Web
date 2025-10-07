"use client";

import React from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ExternalLink, Github, Linkedin, Edit, Copy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

interface Profile {
  _id?: string;
  name?: string;
  userName?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  image?: string;
  userSkills?: string[];
  userSkillsLastUpdated?: string;
  prepYatra?: {
    experienceLevel?: string;
    goal?: string;
    skills?: string[];
    targetCompanies?: string[];
    preferences?: {
      focusAreas?: string[];
      interviewCategories?: string[];
    };
  };
  createdAt?: string;
  occupation?: string;
  purpose?: string[];
}

interface User {
  name?: string;
  picture?: string;
  id?: string;
}

interface ProfileSectionProps {
  user?: User;
  profile?: Profile;
  onEditClick?: () => void;
}

/** ✅ Add https:// protocol if missing */
const withProtocol = (url: string) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

/** ✅ Safe initials fallback */
const getInitials = (name?: string) => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  profile,
  onEditClick,
}) => {
  const router = useRouter();

  /** ✅ Safely handle route navigation */
  const handleViewJourneyClick = () => {
    if (profile?.userName) {
      router.push(`/journey/${profile.userName}`);
    }
  };

  /** ✅ Client-safe clipboard copy */
  const handleShareJourneyClick = async () => {
    if (typeof window === "undefined" || !profile?.userName) return;

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
  };

  return (
    <Card className="mb-6">
      <CardHeader className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage
            src={profile?.image || user?.picture}
            alt={profile?.name || user?.name}
          />
          <AvatarFallback className="text-lg">
            {getInitials(profile?.name || user?.name)}
          </AvatarFallback>
        </Avatar>

        <Text level="h3" className="text-xl font-bold">
          {profile?.name || user?.name}
        </Text>

        <Text level="p" className="text-muted-foreground">
          @{profile?.userName || user?.name?.toLowerCase()}
        </Text>

        {/* ✅ Social Links */}
        <FlexContainer className="justify-center gap-3 mt-4">
           {profile?.linkedInUrl && (
             <a
               href={withProtocol(profile.linkedInUrl)}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center justify-center w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
             >
               <Linkedin className="w-4 h-4 text-white" />
             </a>
           )}

          {profile?.githubUrl && (
            <a
              href={withProtocol(profile.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <Github className="w-4 h-4 text-white" />
            </a>
          )}

          {profile?.leetCodeUrl && (
            <a
              href={withProtocol(profile.leetCodeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 border border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          )}
        </FlexContainer>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <FlexContainer className="justify-between text-sm">
            <Text level="span" className="text-muted-foreground">
              Experience:
            </Text>
            <Badge variant="secondary">
              {profile?.prepYatra?.experienceLevel || "Not set"}
            </Badge>
          </FlexContainer>

          <FlexContainer className="justify-between text-sm">
            <Text level="span" className="text-muted-foreground">
              Goal:
            </Text>
            <Badge variant="outline">
              {profile?.prepYatra?.goal || "Not set"}
            </Badge>
          </FlexContainer>

          <FlexContainer className="justify-between text-sm">
            <Text level="span" className="text-muted-foreground">
              Occupation:
            </Text>
            <Text level="span">
              {profile?.occupation
                ? profile.occupation.replace("_", " ")
                : "Not set"}
            </Text>
          </FlexContainer>

          <FlexContainer className="justify-between text-sm">
            <Text level="span" className="text-muted-foreground">
              Purpose:
            </Text>
            <Text level="span">
              {profile?.purpose?.length
                ? profile.purpose.map((p) => String(p).replace("_", " ")).join(", ")
                : "Not set"}
            </Text>
          </FlexContainer>

          <FlexContainer className="justify-between text-sm">
            <Text level="span" className="text-muted-foreground">
              Joined:
            </Text>
            <Text level="span">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </FlexContainer>
        </div>

        {/* ✅ Action Buttons */}
        <FlexContainer className="flex flex-col gap-3 mt-6">
          {onEditClick && (
            <Button
              onClick={onEditClick}
              className="bg-yellow-600 rounded-md hover:bg-yellow-700 text-black font-medium"
              variant="OUTLINE"
              text="Edit Onboarding Details"
              icon={<Edit className="w-4 h-4 mr-2" />}
            />
          )}

          {profile?.userName && (
            <Button
              onClick={handleShareJourneyClick}
              variant="OUTLINE"
              className="bg-yellow-600 rounded-md hover:bg-yellow-700 text-black font-medium"
              text="Share Your Journey"
              icon={<Copy className="w-4 h-4 mr-2" />}
            />
          )}
        </FlexContainer>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
