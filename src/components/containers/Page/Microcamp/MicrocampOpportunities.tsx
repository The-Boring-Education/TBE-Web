import { FlexContainer, Section, Text } from '@/components';
import { MicrocampOpportunitiesProps } from '@/interfaces';

const MicrocampOpportunities = ({
  heading,
  cards,
}: MicrocampOpportunitiesProps) => {
  return (
    <Section>
      <FlexContainer direction='col' className='gap-5'>
        <FlexContainer direction='col' className='gap-1'>
          <Text
            level='p'
            className='text-base font-semibold text-grey'
            textCenter={true}
          >
            TALK ABOUT OPPORTUNITIES IN
          </Text>
          <Text level='h4' className='heading-4 text-primary' textCenter={true}>
            {heading}
          </Text>
        </FlexContainer>
        <FlexContainer className='gap-5'>
          {cards.map(({ label, value, subtitle }, key) => {
            return (
              <FlexContainer
                key={key}
                direction='col'
                className='items-start gap-3 rounded-2 bg-black p-5'
                itemCenter={false}
              >
                <div className='flex flex-col items-start gap-1'>
                  <Text
                    level='p'
                    className='pre-title text-grey'
                    textCenter={true}
                  >
                    {label}
                  </Text>
                  <Text
                    level='h3'
                    className='heading-3 text-secondary'
                    textCenter={true}
                  >
                    {value}
                  </Text>
                </div>
                <Text
                  level='p'
                  className='pre-title italic text-grey'
                  textCenter={true}
                >
                  {subtitle}
                </Text>
              </FlexContainer>
            );
          })}
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default MicrocampOpportunities;
