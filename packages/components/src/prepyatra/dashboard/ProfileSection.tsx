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
    <Card className="mb-1">
      <CardHeader className="text-center p-2">
        <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-[#FF5757]/20 ring-offset-2">
            <AvatarImage
              src={profile?.image || user?.picture}
              alt={profile?.name || user?.name}
            />
            <AvatarFallback className="text-lg bg-[#FF5757]/10 text-[#FF5757] font-semibold">
              {getInitials(profile?.name || user?.name)}
            </AvatarFallback>
          </Avatar>

        <Text level="h3" className="text-lg font-semibold">
          {profile?.name || user?.name}
        </Text>

        <Text level="p" className="text-xs text-muted-foreground">
          @{profile?.userName || user?.name?.toLowerCase()}
        </Text>

        {/* ✅ Social Links */}
        <FlexContainer className="justify-center gap-2 mt-1">
           {profile?.linkedInUrl && (
             <a
               href={withProtocol(profile.linkedInUrl)}
               target="_blank"
               rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 border-2 border-[#FF5757]/20 bg-white hover:bg-[#FF5757] hover:border-[#FF5757] rounded-lg transition-all duration-200 group"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#FF5757] group-hover:text-white transition-colors" />
                </a>
           )}

          {profile?.githubUrl && (
            <a
              href={withProtocol(profile.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 border-2 border-[#FF5757]/20 bg-white hover:bg-[#FF5757] hover:border-[#FF5757] rounded-lg transition-all duration-200 group"
              >
                <Github className="w-3.5 h-3.5 text-[#FF5757] group-hover:text-white transition-colors" />
              </a>
          )}

          {profile?.leetCodeUrl && (
            <a
              href={withProtocol(profile.leetCodeUrl)}
              target="_blank"
              rel="noopener noreferrer"
             className="inline-flex items-center justify-center w-7 h-7 border-2 border-[#FF5757]/20 bg-white hover:bg-[#FF5757] hover:border-[#FF5757] rounded-lg transition-all duration-200 group"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF5757] group-hover:text-white transition-colors" />
              </a>
              )}
        </FlexContainer>
      </CardHeader>

      <CardContent className="p-1">
        <div className="space-y-1">
          <FlexContainer className="justify-between text-xs items-center">
            <Text level="h1" className="text-muted-foreground text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-[#FF5757]/10 flex items-center justify-center">
                <span className="text-sm">💼</span>
              </div>
              Experience
            </Text>
            <Badge variant="default" className="bg-[#FF5757] text-white border-0 text-xs px-3 py-1">
              {profile?.prepYatra?.experienceLevel || "Not set"}
            </Badge>
          </FlexContainer>

          <div className="border-t border-[#FF5757]/10"></div>

          <FlexContainer className="justify-between text-xs items-center">
          <Text level="h1" className="text-muted-foreground text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-[#FF5757]/10 flex items-center justify-center">
              <span className="text-sm">🎯</span>
            </div>
            Goal
          </Text>
          <Badge variant="default" className="bg-[#FF5757] text-white border-0 text-xs px-3 py-1">
            {profile?.prepYatra?.goal || "Not set"}
          </Badge>
        </FlexContainer>
         
          <div className="border-t border-[#FF5757]/10"></div>

         <FlexContainer className="justify-between text-xs items-center">
          <Text level="h1" className="text-muted-foreground text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-[#FF5757]/10 flex items-center justify-center">
              <span className="text-sm">👔</span>
            </div>
            Occupation
          </Text>
          <Badge variant="default" className="bg-[#FF5757] text-white border-0 text-xs px-3 py-1">
            {profile?.occupation ? profile.occupation.replace("_", " ") : "Not set"}
          </Badge>
        </FlexContainer>
         
         <div className="border-t border-[#FF5757]/10"></div>

          <FlexContainer className="justify-between text-xs items-center">
            <Text level="h1" className="text-muted-foreground text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-[#FF5757]/10 flex items-center justify-center">
                <span className="text-sm">🎓</span>
              </div>
              Purpose
            </Text>
              <Badge variant="default" className="bg-[#FF5757] text-white border-0 text-xs px-3 py-1 max-w-[65%] text-right">
                {profile?.purpose?.length
                  ? profile.purpose.map((p) => String(p).replace("_", " ")).join(", ")
                  : "Not set"}
              </Badge>

          
          </FlexContainer>

          <div className="border-t border-[#FF5757]/10"></div>

          <FlexContainer className="justify-between text-xs items-center">
            <Text level="h1" className="text-muted-foreground text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-[#FF5757]/10 flex items-center justify-center">
                <span className="text-sm">📅</span>
              </div>
              Joined
            </Text>
             <Badge variant="default" className="bg-[#FF5757] text-white border-0 text-xs px-3 py-1">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "Unknown"}
              </Badge>
          </FlexContainer>
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex flex-col gap-2 mt-2 items-stretch w-full">

        {profile?.userName && (
            <Button
              onClick={handleShareJourneyClick}
              variant="OUTLINE"
              text="Share Your Journey"
              size="SMALL"
              className="w-full border-2 border-[#FF5757] text-[#FF5757] hover:bg-[#FF5757] hover:text-white transition-all duration-200 font-semibold"
              icon={<Copy className="w-2 h-2 mr-2" />}
            />
          )}
          
          {onEditClick && (
            <Button
              onClick={onEditClick}
              variant="OUTLINE"
              text="Edit Onboarding Details"
              size="SMALL"
              className="w-full border-2 border-[#FF5757] text-[#FF5757] hover:bg-[#FF5757] hover:text-white transition-all duration-200 font-semibold"
              icon={<Edit className="w-2 h-2 mr-2" />}
            />
          )}

         
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
