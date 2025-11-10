import { GradientContainer, Image, Text } from '@tbe/components';
import type { TestimonialCardProps } from '@tbe/interface';

const TestimonialCard = ({
  image,
  imageAltText,
  title,
  content,
  work,
}: TestimonialCardProps) => (
  <GradientContainer className='max-w-sm border-borderColor3'>
    <Image
      alt={imageAltText}
      className='h-12 w-12 rounded-full border object-cover'
      fullWidth={false}
      src={`${image}`}
    />
    <Text className='paragraph mt-2 font-medium' level='p'>
      {title}
    </Text>
    <Text className='paragraph mt-1' level='p'>
      {content}
    </Text>
    <Text className='paragraph span mt-2 text-secondary' level='p'>
      {work}
    </Text>
  </GradientContainer>
);

export default TestimonialCard;
