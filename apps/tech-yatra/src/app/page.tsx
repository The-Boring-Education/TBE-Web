'use client';

import { Header, LearningSection,TabSection } from '@tbe/components/techyatra';
import { Button } from '@ui/button';
import { ArrowRight, Github,Instagram, Linkedin } from 'lucide-react';
import React from 'react';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="px-4 py-24 text-center bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-pink-50 mt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Confused What to Learn
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              in Tech?
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Start Your Yatra Here 🚀
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get personalized learning paths based on your interests and goals. Whether you&apos;re a student starting fresh or a working professional looking to upskill — we&apos;ve got the perfect roadmap for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => scrollToSection('learning-paths')}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              Start Exploring <ArrowRight className="ml-2" size={24} />
            </Button>
            
            <Button 
              onClick={() => scrollToSection('free-learning')}
              variant="outline"
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Learn Tech Free 📚
            </Button>
          </div>
        </div>
      </section>

      {/* Main Learning Paths Section */}
      <div id="learning-paths">
        <TabSection />
      </div>

      {/* Free Learning Section */}
      <div id="free-learning">
        <LearningSection />
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Social Links */}
          <div className="flex justify-center space-x-8 mb-8">
            <a 
              href="https://theboringeducation.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-2 group-hover:shadow-lg">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-sm font-medium">Website</span>
            </a>
            
            <a 
              href="https://instagram.com/theboringfounder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-2 group-hover:shadow-lg">
                <Instagram size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">Instagram</span>
            </a>
            
            <a 
              href="https://linkedin.com/in/imsks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-2 group-hover:shadow-lg">
                <Linkedin size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            
            <a 
              href="https://github.com/imsks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-2 group-hover:shadow-lg">
                <Github size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
          
          {/* Main Logo/Brand */}
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TechYatra
            </h3>
            <p className="text-gray-300 text-lg">Your roadmap to mastering tech, made for Bharat</p>
          </div>
          
          {/* Bottom Attribution */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-gray-400">
              Built with ❤️ by The Boring Education
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile sticky navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-2xl md:hidden z-40">
        <div className="flex justify-around py-3">
          <Button 
            variant="ghost"
            onClick={() => scrollToSection('learning-paths')}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-blue-600 h-auto"
          >
            <span className="text-lg mb-1">🎯</span>
            <span className="text-xs font-medium">Explore</span>
          </Button>
          <Button 
            variant="ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-purple-600 h-auto"
          >
            <span className="text-lg mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button 
            variant="ghost"
            onClick={() => scrollToSection('free-learning')}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-green-600 h-auto"
          >
            <span className="text-lg mb-1">📚</span>
            <span className="text-xs font-medium">Learn</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

