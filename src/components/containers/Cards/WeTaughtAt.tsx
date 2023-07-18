import { Section, Text, WeTaughtAtCard } from '@/components';
import { WE_TAUGHT } from '@/constant';

// TODO: refactor
const WeTaughtAt = () => {
  return (
    <Section>
      <div className='flex w-full flex-col items-center justify-center'>
        <div className='mb-4 flex'>
          <Text level='h3' className='heading-3' textCenter={true}>
            We already <span className=' text-primary'>taught</span> at
          </Text>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-2 md:gap-4'>
          {WE_TAUGHT.map((item) => {
            const { id } = item;
            return <WeTaughtAtCard key={id} {...item} />;
          })}
        </div>
      </div>
    </Section>
  );
};

export default WeTaughtAt;
