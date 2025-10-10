"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Target, Brain, Clock, Sparkles } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const targetOptions = [
    { id: 'startup', name: 'Startup', emoji: '🚀', description: 'Core fundamentals for early-stage companies' },
    { id: 'mnc', name: 'Mid-size MNC', emoji: '🏢', description: 'Comprehensive prep for established companies' },
    { id: 'faang', name: 'FAANG', emoji: '🌟', description: 'Advanced concepts for top-tier tech giants' }
  ];

  const domainOptions = [
    { id: 'fullstack', name: 'Full-stack', emoji: '💻', description: 'End-to-end development focus' },
    { id: 'datascience', name: 'Data Science', emoji: '📊', description: 'Analytics and ML-oriented problems' },
    { id: 'appdev', name: 'App Dev', emoji: '📱', description: 'Mobile and app development patterns' },
    { id: 'ml', name: 'Machine Learning', emoji: '🤖', description: 'AI and optimization challenges' },
    { id: 'analyst', name: 'Data Analyst', emoji: '📈', description: 'SQL and data manipulation focus' },
    { id: 'ai', name: 'AI', emoji: '🧠', description: 'Artificial intelligence algorithms' }
  ];

  const timeOptions = [
    { id: '2months', name: '2 Months ONLY', emoji: '⚡', description: 'Intensive crash course' },
    { id: '3-4months', name: '3-4 Months', emoji: '🎯', description: 'Balanced comprehensive learning' },
    { id: '5+months', name: '5+ Months', emoji: '🏔️', description: 'Complete mastery journey' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DSA Yatra
              </h1>
              <p className="text-lg text-gray-400 mt-2">By The Boring Education</p>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your personalized journey to master Data Structures & Algorithms
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Target-based Section */}
          <motion.div variants={cardVariants} className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Target className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">🎯 Choose Your Target</h2>
              </div>
              <p className="text-gray-400">Select based on your dream company</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {targetOptions.map((option) => (
                <Link key={option.id} href={`/target/${option.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-lg border border-emerald-500/30 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {option.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                    <p className="text-gray-300 text-sm">{option.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Domain-based Section */}
          <motion.div variants={cardVariants} className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">🧠 Choose Your Domain</h2>
              </div>
              <p className="text-gray-400">Pick your specialization area</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {domainOptions.map((option) => (
                <Link key={option.id} href={`/domain/${option.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {option.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                    <p className="text-gray-300 text-sm">{option.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Time-based Section */}
          <motion.div variants={cardVariants} className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-bold text-white">⏳ Choose Your Timeline</h2>
              </div>
              <p className="text-gray-400">How much time do you have?</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {timeOptions.map((option) => (
                <Link key={option.id} href={`/time/${option.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg border border-orange-500/30 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {option.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                    <p className="text-gray-300 text-sm">{option.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-16 py-8 border-t border-gray-700"
        >
          <p className="text-gray-400">
            Built by{" "}
            <a
              href="https://github.com/imsks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sachin
            </a>{" "}
            with ❤️ at{" "}
            <a
              href="https://theboringeducation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              The Boring Education
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

