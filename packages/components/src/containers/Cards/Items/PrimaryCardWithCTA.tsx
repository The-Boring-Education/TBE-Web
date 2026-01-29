import { GradientContainer, Image, LinkButton, Text } from '@tbe/components';
import type { PrimaryCardWithCTAProps } from '@tbe/interface';

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
  isPurchased,
}: PrimaryCardWithCTAProps) => {
  const border = `border-borderColor${borderColour}`;

  return (
    <GradientContainer
      childrenClassName='p-2 h-full flex flex-col relative'
      className={`md:w-[45%] lg:w-[30%] max-w-md ${border} flex-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
    >
      {isPurchased ? (
        <div className='absolute top-3 right-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-[12px] font-medium px-3 py-[4px] rounded-full border border-green-300 dark:border-green-700 shadow-sm z-10'>
          ✅ Purchased
        </div>
      ) : isPremium ? (
        <div className='absolute top-3 right-3 bg-yellow-100 dark:bg-yellow-900 text-red-600 dark:text-red-300 text-[12px] font-medium px-3 py-[4px] rounded-full border border-yellow-300 dark:border-yellow-700 shadow-sm z-10'>
          🔒 Premium
        </div>
      ) : null}

      {image && (
        <Image
          alt={imageAltText}
          className='m-auto w-4/5 rounded-t-lg object-cover'
          src={`${image}`}
        />
      )}
      <div className='mt-2'>
        <Text className='heading-5 truncate text-gray-900' level='h5'>
          {title}
        </Text>
        <Text className='pre-title mt-1 text-grey  line-clamp-1' level='p'>
          {content}
        </Text>
        {launchingOn && (
          <Text className='pre-title mt-1 text-primary s' level='p'>
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
          noLoader
        />
      </div>
    </GradientContainer>
  );
};

export default PrimaryCardWithCTA;
