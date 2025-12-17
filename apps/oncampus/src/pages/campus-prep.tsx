import { Fragment } from "react";

import { Button } from "@tbe/components";
import { Bell, BookOpen, Code, FileText, Clipboard, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

export default function CampusPrepLanding() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
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

        {/* Resources Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h2 className="text-center text-2xl font-semibold">
            <span className="text-white">Our </span>
            <span className="text-[#FF5757]">Resources</span>
          </h2>

          <p className="text-center text-white/70 mt-3 max-w-2xl mx-auto text-sm">
            Hand-picked resources to help you prepare for placements — practice, learn, and apply.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Aptitude Practice", desc: "Daily challenges, streak tracking & top practice links for Quant, Verbal, DI, and Reasoning.", href: "/aptitude", Icon: BookOpen },
              { title: "Interview Prep", desc: "CS Fundamentals, HR tips, mock interview questions, and more.", href: "/interview-prep", Icon: Code },
              { title: "DSA Preparation", desc: "Playlists, coding sites, and problem sets for hands-on algorithm practice.", href: "/dsa", Icon: FileText },
              { title: "Resume Zone", desc: "Live preview builder and free templates for standout resumes.", href: "/resume", Icon: Clipboard },
              { title: "Interview Experiences", desc: "Real candidate stories and advice from recent interviews.", href: "/experiences", Icon: Users },
              { title: "Company Hub", desc: "Practice company-specific questions, get campus ready.", href: "/companies", Icon: Briefcase },
            ].map((item) => (
              <motion.a
                key={item.title}
                whileHover={{ scale: 1.02, y: -6, boxShadow: "0 20px 40px rgba(255,87,87,0.18), 0 0 0 6px rgba(255,87,87,0.08)" }}
                transition={{ type: "spring", stiffness: 300 }}
                href={item.href}
                style={{ boxShadow: "0 8px 20px rgba(255,87,87,0.06)" }}
                className="block bg-white/95 rounded-2xl p-6 shadow-md border border-white/5 transform transition duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#FF5757]/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-[#FF5757] text-white flex items-center justify-center flex-shrink-0">
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-semibold text-sm">{item.title}</h3>
                    <p className="text-slate-600 text-[13px] mt-2">{item.desc}</p>
                    <div className="mt-3">
                      <span className="text-[#FF5757] text-sm font-medium underline">See {item.title.split(" ")[0]}</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      </div>
    </Fragment>
  );
}
