"use client";
import { Footer, Navbar } from "@tbe/components";
import {
  LearningSection,
  TabSection,
  TechYatraHero,
  TechYatraMobileNav,
} from "@tbe/components/techyatra";
import React from "react";

const Home = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Navbar variant="techyatra" />
      <TechYatraHero
        onExplore={() => scrollToSection("learning-paths")}
        onLearnFree={() => scrollToSection("free-learning")}
      />

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

      <TechYatraMobileNav
        onExplore={() => scrollToSection("learning-paths")}
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onLearn={() => scrollToSection("free-learning")}
      />
    </div>
  );
};

export default Home;
