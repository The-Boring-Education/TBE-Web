import {
    CardContainerA,
    FAQSection,
    LandingPageHero,
    LinkButton,
    SEO,
} from '@tbe/components';
import { DSA_YATRA_FEATURES, generateSectionPath, LINKS, PAGE_REFRESH_TIMEOUT, routes, STATIC_FILE_PATH } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const FAQS = [
    {
        question: 'Is DSA Yatra free?',
        answer:
            'Yes. You get free access to structured content and practice. We also offer premium paths with tailored roadmaps, company-focused question sets, and deeper tracking—so you can start free and upgrade when you want more focus.',
    },
    {
        question: 'How is this different from solving random LeetCode problems?',
        answer:
            'DSA Yatra gives you a structured path instead of a random list. You follow a curated sequence by target (e.g. Startups, MNCs, MAANG), build concept mastery with patterns and revisions, and avoid wasting time on problems that don’t match your goal.',
    },
    {
        question: 'Do I need prior DSA or coding experience?',
        answer:
            'No. We have paths for absolute beginners as well as for developers who already know basics and want to level up for interviews. Pick your current level and we’ll suggest the right starting point.',
    },
    {
        question: 'What kind of roles or companies are the paths for?',
        answer:
            'Paths are tailored for Startups, MNCs, and MAANG-style interviews. You choose your target and get question sets and a timeline designed for that type of role, so your practice is aligned with real interviews.',
    },
    {
        question: 'How much time do I need to commit?',
        answer:
            'It depends on your path and deadline. Each path has a suggested timeline; you can follow it as-is or adjust to your pace. The structure helps you stay consistent instead of burning out on random problems.',
    },
];

const LandingPage = ({ seoMeta }: PageProps) => (
    <Fragment>
        <SEO seoMeta={seoMeta} />

        <LandingPageHero
            backgroundImageUrl={`${STATIC_FILE_PATH.svg}/dsa-yatra.svg`}
            heroText='Stop grinding random LeetCode questions. Follow a structured path tailored to your goals and timeline.'
            primaryButton={
                <LinkButton
                    buttonProps={{
                        variant: 'PRIMARY',
                        text: 'Get Started',
                        className: 'w-full',
                    }}
                    className='w-full sm:w-fit'
                    href={routes.dsayatra.dashboard}
                />
            }
            secondaryButton={
                <LinkButton
                    buttonProps={{
                        variant: 'OUTLINE',
                        text: 'Book Free Session',
                        className: 'w-full',
                    }}
                    className='w-full sm:w-fit'
                    href={LINKS.bookTechConsultation}
                    target='_blank'
                />
            }
            sectionHeaderProps={{
                heading: 'Stop Grinding Random',
                focusText: 'LeetCode Questions',
            }}
        />

        <div id="features">
            <CardContainerA
                borderColour={4}
                cards={DSA_YATRA_FEATURES}
                focusText="DSA Yatra?"
                heading="Why Choose"
                subtext="We make data structures and algorithms less boring and more effective."
            />
        </div>

        <FAQSection faqs={FAQS} heading="Common Questions" />
    </Fragment>
);

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: '/', appId: 'dsayatra' })),
    revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default LandingPage;
