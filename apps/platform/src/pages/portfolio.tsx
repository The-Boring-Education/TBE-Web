import {
  CardContainerA,
  FlexContainer,
  LandingPageHero,
  LinkButton,
  PortfolioCard,
  PortfolioTemplate,
  Section,
  SectionHeaderContainer,
  SEO,
} from '@tbe/components';
import {
  PORTFOLIO_CARDS,
  PORTFOLIO_FEATURES,
  PORTFOLIO_TEMPLATES,
  routes,
  STATIC_FILE_PATH,
} from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Portfolio = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <LandingPageHero
      backgroundImageUrl={`${STATIC_FILE_PATH.svg}/the-boring-portfolio-hero.svg`}
      heroText='Your resume tells, your portfolio shows. Pick a ready-to-use template built by the community and launch your personal portfolio website today.'
      primaryButton={
        <LinkButton
          buttonProps={{
            variant: 'PRIMARY',
            text: 'Explore Templates',
            className: 'w-full',
          }}
          className='w-full sm:w-fit'
          href={`#${routes.internals.landing.portfolio}`}
        />
      }
      sectionHeaderProps={{
        heading: 'Create Your Personal',
        focusText: 'Portfolio Website',
      }}
    />
    <CardContainerA
      borderColour={4}
      cards={PORTFOLIO_FEATURES}
      focusText='Portfolio'
      heading='Why The Boring'
    />
    <Section>
      <FlexContainer className='gap-4 md:gap-6' direction='col'>
        <SectionHeaderContainer
          focusText='Portfolio?'
          heading='Why do you need a'
        />
        <FlexContainer className='gap-2'>
          {PORTFOLIO_CARDS.map((card, index) => (
            <PortfolioCard
              key={card.id}
              description={card.description}
              imageUrl={card.imageUrl}
              index={index + 1}
              title={card.title}
            />
          ))}
        </FlexContainer>
      </FlexContainer>
    </Section>
    <Section
      className='md:px-8 md:py-8 px-2 py-4 bg-[#0A0A0A]'
      id={routes.internals.landing.portfolio}
    >
      <FlexContainer className='gap-4 md:gap-6' direction='col'>
        <SectionHeaderContainer
          focusText='Templates'
          heading='Portfolio'
          subtext='Fork a template, make it yours and ship it.'
          theme='dark'
        />
        <FlexContainer className='gap-2'>
          {PORTFOLIO_TEMPLATES.map((template) => (
            <PortfolioTemplate key={template.id} {...template} />
          ))}
        </FlexContainer>
      </FlexContainer>
    </Section>
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.portfolio })),
});

export default Portfolio;
