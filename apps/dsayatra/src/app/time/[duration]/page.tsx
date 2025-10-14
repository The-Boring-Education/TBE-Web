"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { timeBasedData, Topic } from "@/data/dsaData";

export default function TimeRoadmap() {
  const params = useParams();
  const duration = params?.duration as string;
  const data = timeBasedData[duration as keyof typeof timeBasedData] || [];

  const getTitle = (duration: string) => {
    switch (duration) {
      case '2months': return '2 Months Intensive';
      case '3-4months': return '3-4 Months Balanced';
      case '5+months': return '5+ Months Mastery';
      default: return 'DSA Roadmap';
    }
  };

  const getDescription = (duration: string) => {
    switch (duration) {
      case '2months': return 'Crash course covering essential topics only';
      case '3-4months': return 'Comprehensive learning with balanced pace';
      case '5+months': return 'Complete mastery including advanced concepts';
      default: return 'Your time-based learning path';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{getTitle(duration || '')}</h1>
            <p className="text-gray-300 mt-1">{getDescription(duration || '')}</p>
          </div>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid gap-8"
        >
          {data.map((topic: Topic, index: number) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{topic.emoji}</span>
                <h2 className="text-2xl font-bold text-white">{topic.topic}</h2>
              </div>
              
              <div className="grid gap-4">
                {topic.questions.map((question, qIndex) => (
                  <motion.a
                    key={qIndex}
                    href={question.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (qIndex * 0.05), duration: 0.3 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                        {question.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
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
            at{" "}
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

