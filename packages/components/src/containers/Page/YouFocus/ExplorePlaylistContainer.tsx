import {
  Button,
  FlexContainer,
  RadioButtonContainer,
  SectionHeaderContainer,
} from '@tbe/components';
import { routes, YOUFOCUS_SKILL_PLAYLISTS } from '@tbe/constants';
import type { ExploreCantainerCardProps } from '@tbe/interface';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

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
        focusText={focusText}
        heading={heading}
        headingLevel={4}
        subtext={subtext}
      />
      <FlexContainer className='gap-4' direction='col'>
        <FlexContainer className='gap-1 mx-auto max-w-lg'>
          <RadioButtonContainer
            options={YOUFOCUS_SKILL_PLAYLISTS}
            selectedValue={selectedSkill}
            onChange={handleSkillClick}
          />
        </FlexContainer>
        <div className='max-w-md'>
          <Button
            active={!!selectedSkill}
            className='mx-auto'
            text='Explore Playlists'
            variant='PRIMARY'
            onClick={handleExploreClick}
          />
        </div>
      </FlexContainer>
    </FlexContainer>
  );
};

export default ExplorePlaylistContainer;
