import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  FlexContainer,
  Button,
  SectionHeaderContainer,
  RadioButtonContainer,
} from '@/components';
import { ExploreCantainerCardProps } from '@/interfaces';
import { YOUFOCUS_SKILL_PLAYLISTS, routes } from '@/constant';

const ExplorePlaylistContainer = ({
  heading,
  focusText,
  subtext,
  isCenterAligned = false,
}: ExploreCantainerCardProps) => {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const handleSkillClick = (value: string) => {
    setSelectedSkill(value);
  };

  const handleExploreClick = () => {
    if (selectedSkill) {
      router.push(
        `${routes.explorePlaylistSkill}?q=${encodeURIComponent(selectedSkill)}`
      );
    }
  };

  return (
    <FlexContainer
      className={`border px-4 py-4 md:px-8 md:py-8 w-fit rounded-2 gap-4 ${
        isCenterAligned && 'mx-auto'
      }`}
      direction='col'
    >
      <SectionHeaderContainer
        heading={heading}
        focusText={focusText}
        headingLevel={4}
        subtext={subtext}
      />
      <FlexContainer direction='col' className='gap-4'>
        <FlexContainer className='gap-1 mx-auto max-w-lg'>
          <RadioButtonContainer
            options={YOUFOCUS_SKILL_PLAYLISTS}
            selectedValue={selectedSkill}
            onChange={handleSkillClick}
          />
        </FlexContainer>
        <div className='max-w-md'>
          <Button
            variant='PRIMARY'
            className='mx-auto'
            text='Explore Playlists'
            onClick={handleExploreClick}
            active={!!selectedSkill}
          />
        </div>
      </FlexContainer>
    </FlexContainer>
  );
};

export default ExplorePlaylistContainer;
