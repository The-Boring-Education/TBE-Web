"use client"
import { Button, Footer, Navbar } from "@tbe/components"
import { LearningSection, TabSection } from "@tbe/components/techyatra"
import React from "react"

const Home = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen">
      <Navbar variant="techyatra" />
      {/* Hero Section */}
      <section className="px-4 py-24 text-center bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50 mt-16">
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
            Get personalized learning paths based on your interests and goals.
            Whether you&apos;re a student starting fresh or a working
            professional looking to upskill — we&apos;ve got the perfect roadmap
            for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => scrollToSection("learning-paths")}
              variant="PRIMARY"
              size="LARGE"
              className="w-full sm:w-auto"
            >
              Start Exploring 🎯
            </Button>

            <Button
              onClick={() => scrollToSection("free-learning")}
              variant="OUTLINE"
              size="LARGE"
              className="w-full sm:w-auto"
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
      <Footer variant="techyatra" />

      {/* Mobile sticky navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-2xl md:hidden z-40">
        <div className="flex justify-around py-3">
          <Button
            variant="GHOST"
            onClick={() => scrollToSection("learning-paths")}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-blue-600 h-auto"
          >
            <span className="text-lg mb-1">🎯</span>
            <span className="text-xs font-medium">Explore</span>
          </Button>
          <Button
            variant="GHOST"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-purple-600 h-auto"
          >
            <span className="text-lg mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button
            variant="GHOST"
            onClick={() => scrollToSection("free-learning")}
            className="flex flex-col items-center px-2 text-gray-600 hover:text-green-600 h-auto"
          >
            <span className="text-lg mb-1">📚</span>
            <span className="text-xs font-medium">Learn</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home