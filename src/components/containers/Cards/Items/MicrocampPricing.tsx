import {
  FlexContainer,
  GridContainer,
  LinkButton,
  Pill,
  PricingFeatureCard,
  Section,
  Text,
} from '@/components';
import { LINKS } from '@/constant';
import { MicrocampPricingProps } from '@/interfaces';
import { getDiscountPercentage } from '@/utils';

const MicrocampPricing = ({
  basePrice,
  sellingPrice,
  valueProvided,
}: MicrocampPricingProps) => {
  return (
    <Section>
      <FlexContainer direction='col'>
        <FlexContainer direction='col'>
          <Text level='p' className='strong-text' textCenter={true}>
            TECH EDUCATION FOR EVERYONE
          </Text>
          <FlexContainer direction='col' className='pt-2'>
            <Text level='h3' className='heading-3' textCenter={true}>
              Simple <span className='text-primary'>Pricing.</span>
            </Text>
            <Text level='h3' className='heading-3' textCenter={true}>
              Transparent <span className='text-primary'>Pricing.</span>
            </Text>
          </FlexContainer>
          <Text
            level='p'
            className='subtitle pt-1 text-center text-grey md:w-2/3'
            textCenter={true}
          >
            We're building for affordability of our programs. We don't sell you
            anything blindly.
          </Text>
        </FlexContainer>
        <div className='gradient-2 mt-4 w-full rounded-2 px-4 py-8 md:w-10/12 lg:w-2/3'>
          <FlexContainer
            direction='col'
            itemCenter={true}
            className='justify-between'
          >
            <Text level='p' className='strong-text text-contentDark'>
              PRICE YOU PAY
            </Text>
            <FlexContainer
              itemCenter={true}
              className='mt-3 md:justify-between'
            >
              <Text
                level='h2'
                className='heading-3  text-contentDark line-through'
              >
                ₹ {basePrice}
              </Text>
              <Text level='h2' className='heading-2  text-contentDark sm:ml-4'>
                ₹ {sellingPrice}
              </Text>
              <Pill
                text={`${getDiscountPercentage(
                  basePrice,
                  sellingPrice
                )}% Discount`}
                variant='SECONDARY'
                containerClasses='ml-1'
              />
            </FlexContainer>
          </FlexContainer>
          <FlexContainer
            direction='col'
            itemCenter={true}
            className='mt-6 justify-between'
          >
            <Text level='p' className='strong-text text-contentDark'>
              VALUE YOU GET
            </Text>
            <GridContainer className='mt-3 w-full grid-cols-2 grid-cols-[repeat(auto-fit,minmax(100%,1fr))] gap-2 gap-1 rounded-2 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]'>
              {valueProvided.map((item) => {
                const { id } = item;
                return <PricingFeatureCard key={id} {...item} />;
              })}
            </GridContainer>
          </FlexContainer>
          <FlexContainer direction='col' itemCenter={true} className='pt-8'>
            <Text
              level='p'
              className='paragraph text-contentDark'
              textCenter={true}
            >
              CAN'T DECIDE?
            </Text>
            <Text
              level='h4'
              className='heading-4 pt-1 text-contentDark'
              textCenter={true}
            >
              Talk to our Founders
            </Text>
            <Text
              level='p'
              className='paragraph mt-1 text-contentDark'
              textCenter={true}
            >
              Because we don't have a sales team
            </Text>
            <FlexContainer justifyCenter={true} className='mt-3 w-full'>
              <LinkButton
                href={LINKS.juniorInWebEngineeringRegistrationLink}
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Book FREE Tech Consultation',
                }}
                target='BLANK'
              />
            </FlexContainer>
          </FlexContainer>
        </div>
      </FlexContainer>
    </Section>
  );
};

export default MicrocampPricing;
