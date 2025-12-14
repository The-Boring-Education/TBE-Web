import { Fragment } from "react";

import { Button } from "@tbe/components";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

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
      <div className="min-h-screen pt-20 bg-[#0A0A0A]">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              {/* Small tagline */}

              {/* Main Heading */}
              <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold leading-tight">
                <span className="text-white">Advance Your Career with </span>
                <span className="text-[#FF5757]">Campus Prep</span>
              </h1>

              {/* Supporting paragraph */}
              <p className="text-white/70 text-sm leading-relaxed">
                Master DSA, Aptitude, Resume, Interviews, and Projects in one dashboard. 
                Everything you need to ace your campus placements, all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  text="Get Started for Free"
                  onClick={handleGetStarted}
                  variant="PRIMARY"
                  className="text-sm  font-semibold bg-[#FF5757] hover:bg-[#FF5757]/90 text-white"
                  size="MEDIUM"
                  animationType="BOUNCE"
                />
                
              </div>

              {/* Helper text */}
              <p className="text-white/40 text-xs -mt-1">
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
                <Image
                  src="/landing.svg"
                  alt="Students studying with laptops"
                  width={600}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Fragment>
  );
}
