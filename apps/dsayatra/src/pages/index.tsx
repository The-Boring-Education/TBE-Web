import { LinkButton } from '@tbe/components';
import { FAQSection } from '@tbe/components';
import { SEO } from '@tbe/components';
import { LINKS, PAGE_REFRESH_TIMEOUT } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps, cn } from '@tbe/utils';
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import LandingPageHero from '../components/LandingPageHero';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@ui/card";
import { Rocket, Code, Brain } from "lucide-react";

// Feature Cards Data
const FEATURES = [
  {
    id: "1",
    Icon: Rocket,
    title: "Structured Learning Path",
    content: "Don't get lost in random problems. Follow a curated path designed for your target role.",
  },
  {
    id: "2",
    Icon: Code,
    title: "Company Focused",
    content: "Prepare specifically for Startups, MNCs, or MAANG with tailored question sets.",
  },
  {
    id: "3",
    Icon: Brain,
    title: "Concept Mastery",
    content: "Master the underlying patterns, not just memorize solutions.",
  }
];

const FAQS = [
  {
    question: "Is this free?",
    answer: "DSA Yatra offers both free resources and premium tailored paths."
  },
  {
    question: "Do I need prior experience?",
    answer: "We have paths for absolute beginners as well as experienced developers."
  }
];

const LandingPage = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />

      {/* Hero Section */}
      <LandingPageHero
        backgroundImageUrl="/landing.svg"
        imageClassName="w-full max-w-2xl h-64 md:h-96"
        heroText="Master DSA with a Structured Plan"
        sectionHeaderProps={{
          heading: "Your Journey to",
          focusText: "Dream Job",
          subtext: "Stop grinding random LeetCode questions. Follow a structured path tailored to your goals and timeline."
        }}
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Start Your Journey',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href="/dashboard"
          />
        }
        secondaryButton={
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Explore Paths',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href="#features"
          />
        }
      />

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Why Choose <span className="text-primary">DSA Yatra?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              We make data structures and algorithms less boring and more effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {FEATURES.map((feature) => (
              <Card key={feature.id} className={cn(
                "h-full transition-all duration-300 hover:shadow-xl border-primary/20 hover:border-primary",
                "flex flex-col items-center p-8 text-center bg-white group cursor-default relative overflow-hidden"
              )}>
                {/* Blob Background Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="mb-6 w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                  <feature.Icon
                    className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 mb-3">{feature.title}</CardTitle>

                <CardDescription className="text-gray-500 leading-relaxed">
                  {feature.content}
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </div>


      {/* Simple FAQ */}
      {/* <FAQSection
        faqs={FAQS}
        heading="Common Questions"
      /> */}

    </Fragment>
  );
};

export const getStaticProps = async () => {
    try {
        return {
            ...(await getPreFetchProps({ slug: routes.dsayatra.home, appId: "dsayatra" })),
            revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
        };
    } catch (error) {
        console.error("getStaticProps failed:", error);
        return {
            props: { seoMeta: {} },
            revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
        };
    }
};

export default LandingPage;
