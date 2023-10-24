import { GradientContainer, Image, Text } from '@/components';
import { NotAnotherTechCourseCardProps } from '@/interfaces';

const NotAnotherTechCourseCard = ({
  image,
  imageAltText,
  title,
  content,
}: NotAnotherTechCourseCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor4 bg-dark'>
      <Image
        className='flex h-48'
        fullHeight={false}
        src={`${image}`}
        alt={imageAltText}
      />
      <Text level='h4' className='heading-4 pt-4'>
        {title}
      </Text>

      <Text level='p' className='paragraph pt-1 text-grey'>
        {content}
      </Text>
    </GradientContainer>
  );
};

export default NotAnotherTechCourseCard;
