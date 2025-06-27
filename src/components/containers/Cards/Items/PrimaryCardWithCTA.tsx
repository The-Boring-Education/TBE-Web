import { GradientContainer, Image, LinkButton, Text } from '@/components';
import type { PrimaryCardWithCTAProps } from '@/interfaces';

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
  isPremium,
}: PrimaryCardWithCTAProps) => {
  const border = `border-borderColor${borderColour}`;

  return (
    <GradientContainer
      childrenClassName='p-2 h-full flex flex-col relative'
      className={`md:w-[45%] lg:w-[30%] max-w-md ${border} flex-1`}
    >
      {isPremium && (
        <div className='absolute top-3 right-3 bg-yellow-100 text-red-600 text-[12px] font-medium px-3 py-[4px] rounded-full border border-yellow-300 shadow-sm z-10'>
          🔒 Premium
        </div>
      )}

      {image && (
        <Image
          alt={imageAltText}
          className='m-auto w-4/5 rounded-t-lg object-cover'
          src={`${image}`}
        />
      )}
      <div className='mt-2'>
        <Text className='heading-5 truncate' level='h5'>
          {title}
        </Text>
        <Text className='pre-title mt-1 text-grey line-clamp-1' level='p'>
          {content}
        </Text>
        {launchingOn && (
          <Text className='pre-title mt-1 text-primary' level='p'>
            {launchingOn}
          </Text>
        )}
        <LinkButton
          active={active}
          buttonProps={{
            variant: 'PRIMARY',
            text: active && ctaText ? ctaText : 'Coming soon',
            active,
            className: `${!active && 'bg-secondary'} w-full`,
          }}
          className='mt-3 block'
          href={href}
          target={target}
        />
      </div>
    </GradientContainer>
  );
};

export default PrimaryCardWithCTA;
