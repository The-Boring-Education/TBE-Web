import { useAuth } from "@tbe/auth";
import { Button } from "@tbe/components";
import { BookOpen, Zap } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AptitudeComingSoonPage = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const navigateToQuizzes = () => {
        router.push("/quizzes");
    };

    if (isLoading) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <div className="text-gray-300">Loading...</div>
            </div>
        );
    }

    return (
        <div className="px-3 pt-0.5">
            <div className="max-w-2xl mx-auto w-full">
                {/* Main Content */}
                <div className="text-center">

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Aptitude Coming <span style={{ color: "#ff5757" }}>Soon</span>
                    </h1>
                    {/* Subheading */}
                    <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                        We're preparing comprehensive aptitude assessments to help you master problem-solving and logical reasoning. Get ready for the challenge.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        {/* Card 1 */}
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" style={{ backgroundColor: "#ff5757" }} />
                            <div className="relative bg-black rounded-lg border border-gray-800 group-hover:border-[#ff5757]/50 transition-all duration-300 p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1" style={{ color: "#ff5757" }}>
                                        <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Structured Content</h3>
                                        <p className="text-gray-400 text-sm">Curated problems designed to build your aptitude skills</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" style={{ backgroundColor: "#ff5757" }} />
                            <div className="relative bg-black rounded-lg border border-gray-800 group-hover:border-[#ff5757]/50 transition-all duration-300 p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1" style={{ color: "#ff5757" }}>
                                        <Zap className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Instant Feedback</h3>
                                        <p className="text-gray-400 text-sm">Real-time evaluation with detailed explanations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Text */}
                    <div className="mb-8 p-4 bg-black rounded-lg border border-gray-800 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "#ff5757" }} />
                        <p className="text-gray-300 text-sm md:text-base">
                            <span className="font-semibold text-white">In the meantime,</span> sharpen your problem-solving skills with our DSA sheet. We'll be back with the fundamentals to ace aptitude!
                        </p>
                    </div>


                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                            onClick={() => router.push("/dashboard/quizzes")}
                            variant="OUTLINE"
                            className="rounded-lg px-6 py-2 text-white font-medium bg-[#FF5757] hover:bg-[#FF5757]/90 transition-all duration-300 border-100 text-sm"
                            text="Quizes"
                        />
                        <Button
                            onClick={() => router.push("/dashboard/dsa-prep")}
                            variant="OUTLINE"
                            className="rounded-lg px-6 py-2 text-white font-medium bg-[#FF5757] hover:bg-[#FF5757]/90 transition-all duration-300 border-100 text-sm"
                            text="DSA"
                        />
                        <Button
                            onClick={() => router.push("/dashboard/interview-prep")}
                            variant="OUTLINE"
                            className="rounded-lg px-6 py-2 text-white font-medium bg-[#FF5757] hover:bg-[#FF5757]/90 transition-all duration-300 border-100 text-sm"
                            text="Sheets"
                        />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-10 relative">
                    {/* Left accent */}
                    <div className="absolute -left-10 top-1/2 w-20 h-20 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "#ff5757" }} />

                    {/* Right accent */}
                    <div className="absolute -right-10 bottom-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "#ff5757" }} />

                    {/* Timeline/Progress indicator */}
                    <div className="relative z-10 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">What to expect</p>
                        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-700" style={{ borderColor: "#ff5757", color: "#ff5757" }}>1</span>
                            <div className="w-8 h-px bg-gray-700" />
                            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-700" style={{ borderColor: "#ff5757", color: "#ff5757" }}>2</span>
                            <div className="w-8 h-px bg-gray-700" />
                            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-700" style={{ borderColor: "#ff5757", color: "#ff5757" }}>3</span>
                        </div>
                        <div className="mt-4 text-xs text-[#ff5757]">
                            <p>Build fundamentals → Test your limits → Reach mastery</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AptitudeComingSoonPage;