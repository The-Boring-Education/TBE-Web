import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SEO } from "@tbe/components";
import {
  DSA_YATRA_FEATURES,
  PAGE_REFRESH_TIMEOUT,
  routes,
  STATIC_FILE_PATH,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { DSA_YATRA_FAQS } from "@/data/dsaData";

/* ------------------------------------------------------------------ */
/*  Dark FAQ Accordion                                                 */
/* ------------------------------------------------------------------ */
const DarkAccordion = ({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 text-left">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-[#2a2a2a] rounded-xl overflow-hidden bg-[#1a1a1a] hover:border-[#ff5757]/40 transition-all duration-300"
        >
          <button
            className="w-full flex justify-between items-center px-5 py-4 text-left focus:outline-none group"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            type="button"
          >
            <span className="font-semibold text-base text-[#e0e0e0] group-hover:text-white transition-colors">
              {faq.question}
            </span>
            <motion.span
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-[#ff5757]" />
            </motion.span>
          </button>
          {openIndex === i && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-4 text-[#a0a0a0] text-sm leading-relaxed"
            >
              {faq.answer}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Dark Feature Card                                                  */
/* ------------------------------------------------------------------ */
const DarkFeatureCard = ({
  title,
  content,
  image,
  imageAltText,
}: {
  title: string;
  content: string;
  image: string;
  imageAltText: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="flex-1 min-w-[280px] max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#ff5757]/40 hover:shadow-[0_0_30px_rgba(255,87,87,0.1)] transition-all duration-300 group"
  >
    <div className="relative w-48 h-40 mx-auto mb-4 overflow-hidden rounded-lg">
      <Image
        src={image}
        alt={imageAltText}
        fill
        className="object-contain group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <h3 className="text-lg font-bold text-[#e0e0e0] mb-2 group-hover:text-white transition-colors">
      {title}
    </h3>
    <p className="text-sm text-[#a0a0a0] leading-relaxed">{content}</p>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const LandingPage = ({ seoMeta }: PageProps) => (
  <div className="font-sans selection:bg-[#ff5757]/30 selection:text-white">
    <SEO seoMeta={seoMeta} />

    {/* ─── Hero Section ─── */}
    <section className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
      {/* Subtle gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#ff5757]/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-center gap-10"
      >
        {/* Left: Text */}
        <motion.div
          variants={fadeInUp}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#e0e0e0] leading-tight mb-4">
            Stop Grinding Random{" "}
            <span className="text-[#ff5757]">LeetCode Questions</span>
          </h1>
          <p className="text-base md:text-lg text-[#a0a0a0] max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
            Stop grinding random LeetCode questions. Follow a structured path
            tailored to your goals and timeline.
          </p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              href={routes.dsayatra.dashboard}
              className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[#ff5757] hover:bg-[#ff4040] text-white font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(255,87,87,0.4)]"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-7 py-3 rounded-lg border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#ff5757]/50 hover:text-[#e0e0e0] font-semibold text-sm transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Right: Image */}
        <motion.div variants={fadeInUp} className="flex-shrink-0">
          <div className="relative w-56 md:w-64">
            <Image
              src={`${STATIC_FILE_PATH.svg}/dsa-yatra.svg`}
              alt="DSA Yatra Hero"
              width={256}
              height={256}
              className="animate-float"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>

    {/* ─── Features Section ─── */}
    <section id="features" className="px-4 md:px-8 py-16 md:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e0e0e0]">
            Why Choose <span className="text-[#ff5757]">DSA Yatra?</span>
          </h2>
          <p className="text-sm text-[#a0a0a0] mt-2">
            We make data structures and algorithms less boring and more
            effective.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="flex flex-wrap gap-6 justify-center"
        >
          {DSA_YATRA_FEATURES.map((item) => (
            <motion.div key={item.id} variants={fadeInUp}>
              <DarkFeatureCard
                title={item.title}
                content={item.content}
                image={item.image}
                imageAltText={item.imageAltText}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>

    {/* ─── FAQ Section ─── */}
    <section className="px-4 md:px-10 py-16 md:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#ff5757]">
            Common Questions
          </h2>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <DarkAccordion faqs={DSA_YATRA_FAQS} />
        </motion.div>
      </motion.div>
    </section>
  </div>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default LandingPage;
