import { FlexContainer, LinkButton, Text } from '@/components';

import type { MentorshipCardProps } from '@/interfaces';

const MentorshipCard = ({
  heading,
  description,
  link,
}: MentorshipCardProps) => {
  return (
    <FlexContainer
      className='max-w-sm min-h-60 p-4 border rounded shadow gap-4'
      justifyCenter={false}
    >
      <FlexContainer className='gap-1' direction='col' itemCenter={false}>
        <Text className='heading-5' level='h5'>
          {heading}
        </Text>
        <Text className='pre-title' level='p'>
          {description}
        </Text>
      </FlexContainer>

      <FlexContainer>
        <LinkButton
          buttonProps={{
            variant: 'PRIMARY',
            text: 'Book Session',
          }}
          className='block'
          href={link}
          target='_blank'
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default MentorshipCard;
