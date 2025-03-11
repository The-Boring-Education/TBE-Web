import { GradientContainer, Image, LinkButton, Text } from '@/components';
import { PrimaryCardWithCTAProps } from '@/interfaces';

const PrimaryCardWithCTA = ({
  image,
  imageAltText,
  title,
  href,
  content,
  active,
  ctaText,
  borderColour = 4,
  target,
  launchingOn,
}: PrimaryCardWithCTAProps) => {
  const border = `border-borderColor${borderColour}`;

  return (
    <GradientContainer
      className={`md:w-[45%] lg:w-[30%] max-w-md ${border} flex-1`}
      childrenClassName='p-2 h-full flex flex-col'
    >
      {image && (
        <Image
          className='m-auto w-4/5 rounded-t-lg object-cover'
          src={`${image}`}
          alt={imageAltText}
        />
      )}
      <div className='mt-2'>
        <Text level='h5' className='heading-5 truncate'>
          {title}
        </Text>
        <Text level='p' className='pre-title mt-1 text-grey line-clamp-1'>
          {content}
        </Text>
        {launchingOn && (
          <Text level='p' className='pre-title mt-1 text-primary'>
            {launchingOn}
          </Text>
        )}
        <LinkButton
          href={href}
          className='mt-3 block'
          buttonProps={{
            variant: 'PRIMARY',
            text: active && ctaText ? ctaText : 'Coming soon',
            active,
            className: `${!active && 'bg-secondary'} w-full`,
          }}
          target={target}
          active={active}
        />
      </div>
    </GradientContainer>
  );
};

export default PrimaryCardWithCTA;
