import { FlexContainer, Image, Text } from '@/components';
import { SkillProps } from '@/interfaces';

const SkillCardItem = ({ name, image, imageAltText }: SkillProps) => {
  return (
    <FlexContainer direction='col' itemCenter={true} className='max-h-sm'>
      <Image
        className='h-16 w-16'
        src={`${image}`}
        alt={imageAltText}
        fullHeight={false}
        fullWidth={false}
      />

      <Text level='p' className='paragraph mt-4'>
        {name}
      </Text>
    </FlexContainer>
  );
};

export default SkillCardItem;
