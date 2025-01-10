import { Button, FlexContainer } from '@/components';
import { ToggleButtonProps } from '@/interfaces';
import { useState } from 'react';

const ToggleButton = ({
  options,
  activeColor,
  inactiveColor,
  onToggle,
  textColors = ['text-contentLight', 'text-contentLight'],
}: ToggleButtonProps) => {
  const [activeButton, setActiveButton] = useState(options[0]);

  const handleClick = (option: string) => {
    setActiveButton(option);
    onToggle(option);
  };

  return (
    <FlexContainer className='gap-1'>
      {options.map((option) => (
        <Button
          key={option}
          className={`${
            activeButton === option ? activeColor : inactiveColor
          } border-none ${textColors[options.indexOf(option)]}`}
          onClick={() => handleClick(option)}
          variant='GHOST'
          text={option}
        />
      ))}
    </FlexContainer>
  );
};

export default ToggleButton;
