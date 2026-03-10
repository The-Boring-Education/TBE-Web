import { Button, FlexContainer } from "@tbe/components";
import type { ToggleButtonProps } from "@tbe/interface";
import { useState } from "react";

const ToggleButton = ({
  options,
  activeColor,
  inactiveColor,
  onToggle,
  textColors = ["text-contentLight", "text-contentLight"],
}: ToggleButtonProps) => {
  const [activeButton, setActiveButton] = useState(options[0]);

  const handleClick = (option: string) => {
    setActiveButton(option);
    onToggle(option);
  };

  return (
    <FlexContainer className="gap-1">
      {options.map((option) => (
        <Button
          key={option}
          animationClasses="w-fit"
          className={`${
            activeButton === option ? activeColor : inactiveColor
          } border-none ${textColors[options.indexOf(option)]}`}
          text={option}
          variant="GHOST"
          onClick={() => handleClick(option)}
        />
      ))}
    </FlexContainer>
  );
};

export default ToggleButton;
