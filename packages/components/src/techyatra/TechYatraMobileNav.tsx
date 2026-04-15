import React from "react";

import Button from "../common/Buttons/Button";

export type TechYatraMobileNavProps = {
  onExplore: () => void;
  onHome: () => void;
  onLearn: () => void;
};

/**
 * Sticky bottom nav for small screens — design-system Button (GHOST).
 */
const TechYatraMobileNav = ({
  onExplore,
  onHome,
  onLearn,
}: TechYatraMobileNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-lg md:hidden z-40">
    <div className="flex justify-around py-3">
      <Button
        variant="GHOST"
        onClick={onExplore}
        className="flex flex-col items-center px-2 text-greyDark hover:text-primary h-auto border-0"
      >
        <span className="text-lg mb-1">🎯</span>
        <span className="text-xs font-medium">Explore</span>
      </Button>
      <Button
        variant="GHOST"
        onClick={onHome}
        className="flex flex-col items-center px-2 text-greyDark hover:text-primary h-auto border-0"
      >
        <span className="text-lg mb-1">🏠</span>
        <span className="text-xs font-medium">Home</span>
      </Button>
      <Button
        variant="GHOST"
        onClick={onLearn}
        className="flex flex-col items-center px-2 text-greyDark hover:text-primary h-auto border-0"
      >
        <span className="text-lg mb-1">📚</span>
        <span className="text-xs font-medium">Learn</span>
      </Button>
    </div>
  </div>
);

export default TechYatraMobileNav;
