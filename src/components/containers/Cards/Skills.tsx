import {
  CardSectionContainer,
  FlexContainer,
  Section,
  SectionHeaderContainer,
  SkillCard,
} from '@/components';
import { SkillsContainerProps } from '@/interfaces';

const Skills = ({ skills }: SkillsContainerProps) => {
  return (
    <Section>
      <FlexContainer direction='col' className='w-full'>
        <SectionHeaderContainer heading="Skills you'll" focusText='build' />
        <CardSectionContainer>
          {skills.map((skill) => {
            const { id, title, details: skilledDetails } = skill;
            return (
              <SkillCard
                key={id}
                skilledDetails={skilledDetails}
                title={title}
              />
            );
          })}
        </CardSectionContainer>
      </FlexContainer>
    </Section>
  );
};

export default Skills;
