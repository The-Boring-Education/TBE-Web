import { GradientContainer, Image, LinkButton, Text } from '@/components';
import { CohortCardProps } from '@/interfaces';

const ProgramCard = ({
  image,
  imageAltText,
  title,
  href,
  content,
  active,
}: CohortCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor2'>
      <Image
        className='m-auto w-3/5 rounded-t-lg'
        src={`${image}`}
        alt={imageAltText}
      />
      <div className='mt-2'>
        <Text level='h5' className='heading-5'>
          {title}
        </Text>
        <Text level='p' className='pre-title mt-1 text-grey'>
          {content}
        </Text>
        <LinkButton
          href={href}
          className='mt-3 block'
          buttonProps={{
            variant: 'PRIMARY',
            text: active ? 'Registration Open' : 'Coming soon',
            active,
            className: `${!active && 'bg-secondary'}`,
          }}
          target='BLANK'
          active={active}
        />
      </div>
    </GradientContainer>
  );
};

export default ProgramCard;
