import { routes, TOPIC_LABELS } from "@tbe/constants";
import type { UserProfile } from "@tbe/interface";
import { getTimeOfDay, withProtocol } from "@tbe/utils";
import {
  Github,
  Linkedin,
  Monitor,
  PieChart,
  Target,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import Button from "../../common/Buttons/Button";
import { PublicPageSpinner } from "../../common/publicJourney";
import Text from "../../common/Typography/Text";
import NotFound from "../../containers/Cards/NotFound";
import FlexContainer from "../../containers/Page/common/FlexContainer";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import Section from "../../layout/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../prepyatra/ui/card";
import { Progress } from "../../prepyatra/ui/progress";

type TopicRow = { topic: string; count: number; solved: number; label: string };

const parseTopicRows = (raw: unknown): TopicRow[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: { topic?: string; count?: number; solved?: number }) => {
      const topic = String(item.topic || "").toUpperCase();
      if (!topic) return null;
      const count = typeof item.count === "number" ? item.count : 0;
      const solved = typeof item.solved === "number" ? item.solved : 0;
      const label = TOPIC_LABELS[topic] || topic;
      return { topic, count, solved, label };
    })
    .filter((r): r is TopicRow => r !== null)
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Public shareable DSA progress for a username (`/journey/[username]` on DSAYatra).
 * DSAYatra-styled nav/footer; shareable progress for recruiters and peers.
 */
const DsaYatraPublicJourneyPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topicRows, setTopicRows] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { totalSolved, totalQuestions, overallPercentage } = useMemo(() => {
    const tq = topicRows.reduce((acc, t) => acc + t.count, 0);
    const ts = topicRows.reduce((acc, t) => acc + t.solved, 0);
    const pct = tq > 0 ? Math.round((ts / tq) * 100) : 0;
    return { totalSolved: ts, totalQuestions: tq, overallPercentage: pct };
  }, [topicRows]);

  useEffect(() => {
    const run = async () => {
      if (!username || typeof username !== "string") {
        setLoading(false);
        return;
      }

      const api = process.env.NEXT_PUBLIC_API_URL || "";

      try {
        setLoading(true);
        setError("");

        const profileResponse = await fetch(
          `${api}/user?username=${encodeURIComponent(username)}`,
        );

        if (!profileResponse.ok) {
          throw new Error("User not found");
        }

        const profileData = await profileResponse.json();
        const userObj =
          profileData.status && profileData.data
            ? profileData.data
            : profileData;
        setProfile(userObj);

        const userId = userObj?._id;
        if (!userId) {
          return;
        }

        const topicsRes = await fetch(
          `${api}/interview-prep/dsa-sheet?query=topics&userId=${encodeURIComponent(String(userId))}`,
        );
        if (topicsRes.ok) {
          const topicsJson = await topicsRes.json();
          const topics = topicsJson.data?.topics;
          setTopicRows(parseTopicRows(topics));
        } else {
          setTopicRows([]);
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error("DsaYatraPublicJourneyPage:", err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [username]);

  if (loading) {
    return <PublicPageSpinner />;
  }

  if (error || !profile) {
    return <NotFound />;
  }

  const dsa = profile.dsaYatra;
  const targetLabel = dsa?.target || "Interview prep";
  const timelineLabel = dsa?.timeline || "—";
  const expLabel = dsa?.experienceLevel || profile.occupation || "Learner";
  const companyLabel = dsa?.companies?.[0] || "—";

  const goToDsaYatra = () => {
    const base = routes.dsayatra.baseUrl?.replace(/\/$/, "") || "/";
    window.location.href = base;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar variant="dsayatra" />

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
            className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-2 sm:mb-3 max-w-3xl mx-auto"
          >
            DSA Yatra learning journey
          </Text>
          <Text
            level="p"
            className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto"
          >
            Track shared progress — problems solved by topic and overall
            completion.
          </Text>
        </FlexContainer>

        <Card className="max-w-2xl mx-auto mb-8 sm:mb-12 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-4 border-background shadow-lg bg-primary/10 flex items-center justify-center">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3">
              {profile.name}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              @{profile.userName}
            </CardDescription>

            {(profile.linkedInUrl ||
              profile.githubUrl ||
              profile.portfolioUrl) && (
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                {profile.linkedInUrl && (
                  <a
                    href={withProtocol(profile.linkedInUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-border hover:border-primary/50 bg-muted/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={withProtocol(profile.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-border hover:border-primary/50 bg-muted/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={withProtocol(profile.portfolioUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 border-border hover:border-primary/50 bg-muted/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center"
                  >
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base text-left">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">
                  Goal timeline
                </span>
                <p className="text-muted-foreground mt-1">{timelineLabel}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">Focus</span>
                <p className="text-muted-foreground mt-1">{targetLabel}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">Experience</span>
                <p className="text-muted-foreground mt-1">{expLabel}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <span className="font-medium text-foreground">Target</span>
                <p className="text-muted-foreground mt-1">{companyLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-5xl mx-auto mb-10 sm:mb-14">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Overall progress</CardTitle>
                  <CardDescription>
                    {totalSolved} of {totalQuestions} questions
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full bg-muted" />
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-700"
                      style={{
                        background: `conic-gradient(hsl(var(--primary)) ${
                          overallPercentage * 3.6
                        }deg, transparent 0deg)`,
                      }}
                    />
                    <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center border-2 border-background">
                      <span className="text-3xl font-bold text-foreground">
                        {overallPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={overallPercentage} className="h-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">By topic</CardTitle>
                  <CardDescription>
                    Solved counts for their curated track
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 max-h-[280px] overflow-y-auto pr-1 space-y-3">
                {topicRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No topic data yet.
                  </p>
                ) : (
                  topicRows.map((t) => (
                    <div key={t.topic} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground truncate pr-2">
                          {t.label}
                        </span>
                        <span className="text-primary shrink-0 font-semibold">
                          {t.solved}/{t.count}
                        </span>
                      </div>
                      <Progress
                        value={t.count > 0 ? (t.solved / t.count) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <FlexContainer className="text-center mt-8 sm:mt-12">
          <Card className="max-w-3xl mx-auto hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <Text
                level="h3"
                className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6"
              >
                Start your own DSA Yatra
              </Text>
              <Text
                level="p"
                className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
              >
                Practice curated sheets, track streaks, and build the same
                interview-ready problem-solving habit as{" "}
                <span className="text-primary font-medium">{profile.name}</span>
                .
              </Text>
              <div className="flex justify-center">
                <Button
                  text="Open DSAYatra"
                  onClick={goToDsaYatra}
                  variant="PRIMARY"
                  size="MEDIUM"
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg hover:scale-105 transition-transform duration-200"
                />
              </div>
            </CardContent>
          </Card>
        </FlexContainer>
      </Section>

      <Footer variant="dsayatra" />
    </div>
  );
};

export default DsaYatraPublicJourneyPage;
