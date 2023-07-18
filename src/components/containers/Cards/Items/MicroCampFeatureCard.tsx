import { FlexContainer, Text } from '@/components/';
import { MicroCampFeatureCardProps } from '@/interfaces';

const MicroCampFeatureCard = ({
  title,
  content,
}: MicroCampFeatureCardProps) => {
  return (
    <FlexContainer
      direction='col'
      className='gradient-5 rounded-2 px-2 py-2 md:px-4 md:py-4'
    >
      <Text level='h3' className='heading-3 text-center text-contentDark'>
        {title}
      </Text>
      <Text level='p' className='paragraph text-center text-contentDark'>
        {content}
      </Text>
    </FlexContainer>
  );
};

export default MicroCampFeatureCard;
