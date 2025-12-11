import { Button } from "@tbe/components";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { Bell } from "lucide-react";

export default function CampusPrepLanding() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleExploreGuest = () => {
    // TODO: Implement guest exploration
    console.log("Explore as guest");
  };

  return (
    <Fragment>
      {/* Pure black background */}
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Navbar */}
        <nav className="w-full border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#FF5757] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CP</span>
                </div>
                <span className="text-white font-semibold text-lg">Campus Prep</span>
              </div>

              {/* Center: Nav Links */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#learn" className="text-white/80 hover:text-white transition-colors text-sm">
                  Learn
                </a>
                <a href="#tools" className="text-white/80 hover:text-white transition-colors text-sm">
                  Tools
                </a>
                <a href="#links" className="text-white/80 hover:text-white transition-colors text-sm">
                  Links
                </a>
              </div>

              {/* Right: Notification + Login */}
              <div className="flex items-center gap-3">
                <button className="p-2 text-white/80 hover:text-white transition-colors">
                  <Bell size={20} />
                </button>
                <Button
                  text="Login"
                  onClick={handleGetStarted}
                  variant="PRIMARY"
                  className="text-sm px-4 py-2 font-semibold bg-[#FF5757] hover:bg-[#FF5757]/90"
                  size="SMALL"
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Small tagline */}
              <p className="text-white/60 text-sm">For students preparing for placements</p>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Advance Your Career with </span>
                <span className="text-[#FF5757]">Campus Prep</span>
              </h1>

              {/* Supporting paragraph */}
              <p className="text-white/70 text-lg leading-relaxed">
                Master DSA, Aptitude, Resume, Interviews, and Projects in one dashboard. 
                Everything you need to ace your campus placements, all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  text="Get Started for Free"
                  onClick={handleGetStarted}
                  variant="PRIMARY"
                  className="text-sm px-6 py-3 font-semibold bg-[#FF5757] hover:bg-[#FF5757]/90 text-white"
                  size="MEDIUM"
                  animationType="BOUNCE"
                />
                <button
                  onClick={handleExploreGuest}
                  className="px-6 py-3 text-sm font-semibold text-white border-2 border-white/20 rounded-1 hover:bg-white/5 transition-colors"
                >
                  Explore as Guest
                </button>
              </div>

              {/* Helper text */}
              <p className="text-white/40 text-xs pt-2">
                Built for campus schedules
              </p>
            </motion.div>

            {/* Right Column: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-lg">
                <img
                  src="/landing.svg"
                  alt="Students studying with laptops"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Fragment>
  );
}
