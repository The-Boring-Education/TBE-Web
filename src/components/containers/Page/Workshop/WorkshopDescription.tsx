import { FlexContainer, Text } from '@/components';
import { WorkshopDescriptionProps } from '@/interfaces';

const WorkshopDescription = ({
  paragraphs,
  flexProps,
}: WorkshopDescriptionProps) => {
  return (
    <FlexContainer {...flexProps}>
      {paragraphs.map((paragraph, key) => (
        <Text
          level='p'
          className='paragraph [&:not(:first-child)]:mt-3'
          key={key}
        >
          {paragraph}
        </Text>
      ))}
    </FlexContainer>
  );
};

export default WorkshopDescription;
