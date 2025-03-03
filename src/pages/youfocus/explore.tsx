import React, { useState } from 'react';
import {
  FlexContainer,
  Button,
  Section,
  SectionHeaderContainer,
  RadioGroup,
} from '@/components';
import { Skills } from '@/constant';

const Home = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const handleSkillClick = (value: string) => {
    setSelectedSkill(value);
  };

  const handleExploreClick = () => {
    console.log('Selected Skill:', selectedSkill);
  };

  return (
    <Section>
      <FlexContainer
        direction='col'
        className='w-full py-11 justify-center items-center'
      >
        <div className='w-full max-w-md'>
          <SectionHeaderContainer
            heading='Pick A '
            focusText='Skill'
            headingLevel={3}
            subtext='What Do You Want to Learn?'
          />
        </div>

        {/* Skill Selection using RadioGroup */}
        <FlexContainer className='flex-wrap justify-center gap-1 md:gap-2 mx-auto max-w-lg py-5'>
          <RadioGroup
            options={Skills}
            selectedValue={selectedSkill}
            onChange={handleSkillClick}
          />
        </FlexContainer>

        {/* Explore Button */}
        <div className='w-full max-w-md'>
          <Button
            variant='PRIMARY'
            className='w-full mx-auto'
            text='Explore Playlists'
            onClick={handleExploreClick}
          />
        </div>
      </FlexContainer>
    </Section>
  );
};

export default Home;
