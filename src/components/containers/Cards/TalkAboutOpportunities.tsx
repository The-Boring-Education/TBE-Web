import { Section, Text } from '@/components';
import { TALK_ABOUT_OPPORTUNITIES } from '@/constant';

const TalkAboutOpportunities = () => {
  return (
    <Section>
      <div className='flex w-full flex-col items-center justify-center px-10  '>
        <div className='flex flex-col items-center justify-center'>
          <Text level='p' className='paragraph strong-text text-gray-600'>
            TALK ABOUT OPPORTUNITIES IN
          </Text>
          <Text level='h4' className='heading-4 pl-2 text-primary'>
            Front-end Engineering
          </Text>
        </div>
        <div className='flex w-full items-center justify-center   pt-4 '>
          {TALK_ABOUT_OPPORTUNITIES.map((item) => (
            <div
              key={item.id}
              className='mr-4 block max-w-xs rounded-lg border shadow-lg dark:bg-neutral-700'
            >
              <div className='flex w-full items-center justify-around py-4'>
                <div className='flex w-64 flex-col px-2'>
                  <Text
                    level='p'
                    className='paragraph font-semibold text-gray-500'
                  >
                    {item.heading}
                  </Text>
                  <Text level='h4' className='heading-4 my-1'>
                    {item.title}
                  </Text>
                  <Text
                    level='p'
                    className='paragraph font-semibold text-gray-500'
                  >
                    {item.content}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
export default TalkAboutOpportunities;
