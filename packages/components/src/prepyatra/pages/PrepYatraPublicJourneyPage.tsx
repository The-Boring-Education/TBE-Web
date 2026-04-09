import type { PrepLog, UserProfile } from "@tbe/interface";
import { getTimeOfDay, withProtocol } from "@tbe/utils";
import {
  Calendar,
  Clock,
  ExternalLink,
  Github,
  Linkedin,
  User,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import NotFound from "../../containers/Cards/NotFound";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import Section from "../../layout/Section";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

/**
 * Public shareable profile + prep logs for a username (`/journey/[username]`).
 */
export default function PrepYatraPublicJourneyPage() {
  const router = useRouter();
  const { username } = router.query;
  const [prepLogs, setPrepLogs] = useState<PrepLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateLocal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeSpentLocal = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user?username=${username}`,
        );

        if (!profileResponse.ok) {
          throw new Error("User not found");
        }

        const profileData = await profileResponse.json();
        if (profileData.status && profileData.data) {
          setProfile(profileData.data);
        } else {
          setProfile(profileData);
        }

        if (profileData.data?._id || profileData._id) {
          const userId = profileData.data?._id || profileData._id;
          const logsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log?userId=${userId}`,
          );

          if (logsResponse.ok) {
            const logsData = await logsResponse.json();
            if (logsData.status && logsData.data) {
              setPrepLogs(logsData.data || []);
            } else {
              setPrepLogs(logsData || []);
            }
          }
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return <NotFound />;
  }

  const handleGetStarted = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="prepyatra" />

      <Section className="container mx-auto px-4 mt-12 px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <FlexContainer
          direction="col"
          className="text-center mb-12 sm:mb-16 lg:mb-20 mt-4 sm:mt-8"
        >
          <Text
            level="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6"
          >
            {getTimeOfDay()}! Meet{" "}
            <span className="text-primary">{profile.name}</span>
          </Text>
          <Text
            level="p"
            className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto"
          >
            Following their interview preparation journey on PrepYatra
          </Text>
        </FlexContainer>

        <Card className="max-w-2xl mx-auto mb-8 sm:mb-12 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4">
              {profile.name}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mb-4 sm:mb-6">
              @{profile.userName}
            </CardDescription>

            {(profile.linkedInUrl ||
              profile.githubUrl ||
              profile.leetCodeUrl) && (
              <div className="flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                {profile.linkedInUrl && (
                  <a
                    href={withProtocol(profile.linkedInUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={withProtocol(profile.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </a>
                )}
                {profile.leetCodeUrl && (
                  <a
                    href={withProtocol(profile.leetCodeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </a>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
              <div className="bg-gray-50/5 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">
                  Journey Started:
                </span>
                <br />
                <span className="text-muted-foreground">
                  {formatDateLocal(profile.createdAt)}
                </span>
              </div>
              <div className="bg-gray-50/5 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">Goal:</span>
                <br />
                <span className="text-muted-foreground">
                  {profile.prepYatra.goal || "Not specified"}
                </span>
              </div>
            </div>

            {(profile.occupation || profile.purpose) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base pt-4 sm:pt-6">
                {profile.occupation && (
                  <div className="bg-gray-50/5 rounded-lg p-3 sm:p-4">
                    <span className="font-medium text-foreground">
                      Occupation:
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      {profile.occupation.replace("_", " ")}
                    </span>
                  </div>
                )}
                {profile.purpose && profile.purpose.length > 0 && (
                  <div className="bg-gray-50/5 rounded-lg p-3 sm:p-4">
                    <span className="font-medium text-foreground">
                      Purpose:
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      {profile.purpose
                        .map((p) => p.replace("_", " "))
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {profile.userSkills && profile.userSkills.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3">
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {profile.userSkills.map((skill, index) => (
                    <Button
                      key={index}
                      variant="OUTLINE"
                      size="SMALL"
                      text={skill}
                      className="font-medium px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full text-black"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">
            Recent Preparation Sessions
          </h2>

          {prepLogs.length === 0 ? (
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center py-12 sm:py-16">
                <p className="text-muted-foreground text-base sm:text-lg">
                  No preparation logs shared yet. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {prepLogs.slice(0, 10).map((log) => (
                <Card
                  key={log._id}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
                          {log.title}
                        </CardTitle>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {formatDateLocal(log.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {formatTimeSpentLocal(log.timeSpent)}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="self-start sm:self-auto text-xs sm:text-sm px-2 sm:px-3 py-1"
                      >
                        {formatTimeSpentLocal(log.timeSpent)}
                      </Badge>
                    </div>
                  </CardHeader>
                  {log.description && (
                    <CardContent className="pt-0 pb-4 sm:pb-6">
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {log.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <FlexContainer className="text-center mt-12 sm:mt-16 lg:mt-20">
          <Card className="max-w-3xl mx-auto hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <Text
                level="h3"
                className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6"
              >
                Start Your Own PrepYatra Journey
              </Text>
              <Text
                level="p"
                className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
              >
                Track your interview preparation, connect with recruiters, and
                showcase your progress just like{" "}
                <span className="text-primary font-medium">{profile.name}</span>
                !
              </Text>
              <div className="flex justify-center">
                <Button
                  text="Get Started for Free"
                  onClick={handleGetStarted}
                  variant="PRIMARY"
                  size="MEDIUM"
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg hover:scale-105 transition-transform duration-200"
                />
              </div>
            </CardContent>
          </Card>
        </FlexContainer>
      </Section>

      <Footer />
    </div>
  );
}
