import { GradientContainer, FlexContainer, Text } from '@/components/';
import { OpportunityCardProps } from '@/interfaces';

const OpportunityCard = ({ heading, title, content }: OpportunityCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor3 bg-dark'>
      <FlexContainer
        className='items-baseline'
        direction='col'
        itemCenter={false}
      >
        <FlexContainer
          className='items-baseline'
          direction='col'
          itemCenter={false}
        >
          <Text level='p' className='pre-title text-grey'>
            {heading}
          </Text>
          <Text level='h3' className='heading-3 text-textDark my-1'>
            {title}
          </Text>
        </FlexContainer>
        <Text level='p' className='paragraph pt-2 text-grey'>
          {content}
        </Text>
      </FlexContainer>
    </GradientContainer>
  );
};

export default OpportunityCard;
