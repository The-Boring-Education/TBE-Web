import {
  GradientContainer,
  FlexContainer,
  SkillCardItem,
  Text,
} from '@/components';
import { SkillCardProps } from '@/interfaces';

const SkillCard = ({ title, skilledDetails }: SkillCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor4'>
      <FlexContainer itemCenter={true} className='w-full justify-evenly gap-4'>
        {skilledDetails.map((skilledDetail) => {
          const { id, name, image, imageAltText } = skilledDetail;
          return (
            <SkillCardItem
              key={id}
              name={name}
              image={image}
              imageAltText={imageAltText}
            />
          );
        })}
      </FlexContainer>
      <div className='pt-4'>
        <Text level='h5' className='heading-5 text-center'>
          {title}
        </Text>
      </div>
    </GradientContainer>
  );
};

export default SkillCard;
