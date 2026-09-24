import Head from "next/head";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CallToActionSection from "@/components/sections/CallToActionSection";
import CertificateSection from "@/components/sections/CertificateSection";
import HeroSection from "@/components/sections/HeroSection";
import HiringProcessSection from "@/components/sections/HiringProcessSection";
import PerksSection from "@/components/sections/PerksSection";
import RolesGrowthSection from "@/components/sections/RolesGrowthSection";
import TracksSection from "@/components/sections/TracksSection";
import WhyJoinSection from "@/components/sections/WhyJoinSection";
import { SITE } from "@/config/links";

interface ContributorPageProps {
  seo: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
}

export default function ContributorPage({ seo }: ContributorPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.url} />
        <meta property="og:image" content={seo.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.image} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: seo.title,
              description: seo.description,
              url: seo.url,
              publisher: { "@type": "Organization", name: SITE.name },
            }),
          }}
        />
      </Head>

      <Header />

      <main className="flex-1">
        <HeroSection />
        <PerksSection />
        <TracksSection />
        <RolesGrowthSection />
        <CertificateSection />
        <WhyJoinSection />
        <HiringProcessSection />
        <CallToActionSection />
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const title = "TBE Contributor Program – The Boring Education";
  const description =
    "A community of builders, creators and problem solvers. Be a part of The Boring Education Contributor Program and help us make quality tech education accessible to every learner.";
  const url = SITE.baseUrl;
  const image =
    "https://ik.imagekit.io/riufvimprm/devrel/hero-main-illustration.png?updatedAt=1790057685498";

  return {
    props: {
      seo: { title, description, url, image },
    },
  };
}
