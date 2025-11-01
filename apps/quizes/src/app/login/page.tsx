"use client";

import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components/quizes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@tbe/components/quizes";
import { useToast } from "@tbe/components/quizes";
import { Brain, Sparkles, Trophy, Users, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Feature type annotation
type Feature = {
  icon: JSX.Element;
  title: string;
  description: string;
};

export default function Login() {
  const { signIn, user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSignIn = async () => {
    try {
      await signIn("/dashboard");
    } catch (error) {
      // Type annotation for error (optional)
      toast({
        title: "Sign in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const features: Feature[] = [
    {
      icon: <Brain className="w-6 h-6 text-[#FF5757]" />,
      title: "Smart Learning",
      description: "AI-powered questions tailored to your skill level"
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#FF5757]" />,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics"
    },
    {
      icon: <Users className="w-6 h-6 text-[#FF5757]" />,
      title: "Compete",
      description: "Challenge yourself on the global leaderboard"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#FF5757]" />,
      title: "Expert Content",
      description: "Curated by industry professionals"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-black mb-2 text-black">
              Quizes
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              by The Boring Education
            </p>
          </div>

          <p className="text-2xl font-semibold text-black">
            Master tech interviews with <span className="text-[#FF5757]">confidence</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-xl border border-[#1E3A8A] shadow-md"
              >
                <div className="mb-2">{feature.icon}</div>
                <h3 className="font-semibold mb-1 text-black">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#848484]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Card */}
        <Card className="border-2 border-[#1E3A8A] shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black">
              Welcome <span className="text-[#FF5757]">Back</span>
            </CardTitle>
            <CardDescription className="text-[#848484]">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-lg bg-[#FF5757] text-white hover:bg-[#ed3030] font-semibold border border-[#1E3A8A] rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>
            <div className="text-center text-sm text-[#848484]">
              <p>
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="underline hover:text-[#1E3A8A]"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline hover:text-[#1E3A8A]"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
