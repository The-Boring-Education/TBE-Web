import {
  FlexContainer,
  GradientContainer,
  GridContainer,
  LinkButton,
  SectionHeaderContainer,
  Text,
} from "@tbe/components";
import { OPEN_SOURCE_BENEFITS, OPEN_SOURCE_STATS } from "@tbe/constants";
import { motion } from "framer-motion";

const OpenSourceStatsSection = () => (
  <GradientContainer className="border-borderColor2 p-8">
    {/* Header */}
    <FlexContainer direction="col" itemCenter className="mb-12">
      <SectionHeaderContainer
        focusText="Open Source"
        heading="We're Truly"
        subtext="Building the future of tech education together with our amazing community of contributors from around the world."
        className="text-center"
      />
    </FlexContainer>

    {/* Stats Grid */}
    <GridContainer className="grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {OPEN_SOURCE_STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GradientContainer className="border-borderColor3 p-6 h-full">
            <FlexContainer direction="col" itemCenter className="gap-3">
              <Text level="span" className="text-3xl">
                {stat.icon}
              </Text>
              <Text level="h3" className="heading-3 text-primary">
                {stat.number}
              </Text>
              <Text level="p" className="text-gray-600 text-sm font-medium">
                {stat.label}
              </Text>
            </FlexContainer>
          </GradientContainer>
        </motion.div>
      ))}
    </GridContainer>

    {/* Benefits Grid */}
    <div className="mb-12">
      <FlexContainer direction="col" itemCenter className="mb-8">
        <Text level="h4" className="heading-4 text-gray-900 mb-2">
          Why Students Love Contributing Here
        </Text>
        <Text level="p" className="text-gray-600 text-center max-w-2xl">
          Join thousands of students who are already building their careers
          through open source contributions
        </Text>
      </FlexContainer>

      <GridContainer className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {OPEN_SOURCE_BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <GradientContainer className="border-borderColor4 p-6 h-full text-center hover:shadow-lg transition-shadow">
              <FlexContainer direction="col" itemCenter className="gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Text level="span" className="text-2xl">
                    {benefit.icon}
                  </Text>
                </div>
                <Text level="h5" className="heading-5 text-gray-900">
                  {benefit.title}
                </Text>
                <Text level="p" className="text-gray-600 text-sm">
                  {benefit.description}
                </Text>
              </FlexContainer>
            </GradientContainer>
          </motion.div>
        ))}
      </GridContainer>
    </div>

    {/* Call to Action */}
    <FlexContainer direction="col" itemCenter className="gap-6">
      <div className="text-center">
        <Text level="h4" className="heading-4 text-gray-900 mb-3">
          Ready to Make Your First Contribution? 🚀
        </Text>
        <Text level="p" className="text-gray-600 max-w-2xl">
          Whether you're a complete beginner or an experienced developer,
          there's a perfect issue waiting for you. Start your open source
          journey today and become part of something bigger!
        </Text>
      </div>

      <FlexContainer className="gap-4 flex-wrap justify-center">
        <LinkButton
          buttonProps={{
            variant: "PRIMARY",
            text: "Browse Issues",
            className: "w-full sm:w-fit",
          }}
          className="w-full sm:w-fit"
          href="#repositories"
        />
        <LinkButton
          buttonProps={{
            variant: "OUTLINE",
            text: "Join Our Community",
            className: "w-full sm:w-fit",
          }}
          className="w-full sm:w-fit"
          href="https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC"
          target="_blank"
        />
        <LinkButton
          buttonProps={{
            variant: "GHOST",
            text: "Contribution Guide",
            className: "w-full sm:w-fit",
          }}
          className="w-full sm:w-fit"
          href="https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b"
          target="_blank"
        />
      </FlexContainer>

      {/* Student Testimonial */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="bg-white/50 rounded-xl p-6 max-w-3xl text-center border border-gray-200"
      >
        <Text level="p" className="text-gray-700 italic mb-4">
          "Contributing to TBE was my first open source experience. The
          community is so welcoming and the mentors helped me understand
          real-world development practices. Now I have 3 internship offers!"
        </Text>
        <FlexContainer itemCenter justifyCenter className="gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <Text level="span" className="text-white font-bold">
              A
            </Text>
          </div>
          <FlexContainer direction="col" itemCenter={false}>
            <Text level="span" className="font-semibold text-gray-900">
              Arjun Sharma
            </Text>
            <Text level="span" className="text-sm text-gray-600">
              CSE Student, IIT Delhi
            </Text>
          </FlexContainer>
        </FlexContainer>
      </motion.div>
    </FlexContainer>
  </GradientContainer>
);

export default OpenSourceStatsSection;
