import { FlexContainer, Text } from '@/components/';
import { MicroCampPricingCardProps } from '@/interfaces';

const PricingFeatureCard = ({ content }: MicroCampPricingCardProps) => {
  return (
    <FlexContainer
      direction='col'
      itemCenter={true}
      justifyCenter={true}
      className='rounded-2 bg-white px-2 py-3 md:p-3'
    >
      <Text level='p' className='strong-text text-center text-contentLight'>
        {content}
      </Text>
    </FlexContainer>
  );
};

export default PricingFeatureCard;
