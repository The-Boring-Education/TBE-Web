import {
  FlexContainer,
  GradientContainer,
  GridContainer,
  Image,
  LinkButton,
  Section,
  SectionHeaderContainer,
  Text,
} from '@/components';

const ContactCard = () => (
  <>
    {/* Hero Section */}
    <Section>
      <FlexContainer className='py-12 sm:py-16' direction='col' justifyCenter>
        <FlexContainer
          className='wrap-reverse flex-col-reverse gap-8 lg:flex-row'
          itemCenter
          justifyCenter
          wrap={false}
        >
          <FlexContainer
            className='w-full lg:w-1/2 items-center lg:items-start'
            direction='col'
          >
            <SectionHeaderContainer
              focusText='Touch'
              heading='Get In'
              headingLevel={1}
            />
            <Text
              className='paragraph mt-4 w-full text-center lg:text-left text-grey max-w-2xl'
              level='p'
            >
              Have questions about our courses? Want to collaborate? Or just
              want to say hello? We'd love to hear from you! Reach out through
              any of the channels below and we'll get back to you as soon as
              possible.
            </Text>
            <FlexContainer className='mt-6 gap-3 flex-col sm:flex-row'>
              <LinkButton
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Send Email',
                  className: 'w-full sm:w-auto',
                }}
                href='mailto:theboringeducation@gmail.com'
              />
              <LinkButton
                buttonProps={{
                  variant: 'OUTLINE',
                  text: 'Call Us',
                  className: 'w-full sm:w-auto',
                }}
                href='tel:+91-8884966267'
              />
            </FlexContainer>
          </FlexContainer>
          {/* Hero Image */}
          <Image
            alt='Contact The Boring Education'
            className='w-80 lg:w-96'
            fullWidth={false}
            loading='eager'
            src='https://ik.imagekit.io/tbe/webapp/hero-image.svg'
          />
        </FlexContainer>
      </FlexContainer>
    </Section>

    {/* Contact Methods Grid */}
    <Section>
      <SectionHeaderContainer
        focusText='Methods'
        heading='Contact'
        subtext='Choose the most convenient way to reach out to us'
        className='mb-8'
      />
      <GridContainer className='grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Email Card */}
        <GradientContainer className='border-borderColor3 p-6 text-center'>
          <FlexContainer direction='col' itemCenter className='gap-4'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <Text className='text-3xl' level='span'>
                📧
              </Text>
            </div>
            <Text className='heading-5' level='h5'>
              Email Us
            </Text>
            <Text className='paragraph text-greyDark text-sm' level='p'>
              Send us a detailed message and we'll respond within 24 hours
            </Text>
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'theboringeducation@gmail.com',
                className: 'text-sm',
              }}
              href='mailto:theboringeducation@gmail.com'
            />
          </FlexContainer>
        </GradientContainer>

        {/* Phone Card */}
        <GradientContainer className='border-borderColor3 p-6 text-center'>
          <FlexContainer direction='col' itemCenter className='gap-4'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <Text className='text-3xl' level='span'>
                📞
              </Text>
            </div>
            <Text className='heading-5' level='h5'>
              Call Us
            </Text>
            <Text className='paragraph text-greyDark text-sm' level='p'>
              Speak directly with our team for immediate assistance
            </Text>
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: '+91-8884966267',
                className: 'text-sm',
              }}
              href='tel:+91-8884966267'
            />
          </FlexContainer>
        </GradientContainer>

        {/* WhatsApp Card */}
        <GradientContainer className='border-borderColor3 p-6 text-center'>
          <FlexContainer direction='col' itemCenter className='gap-4'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <Text className='text-3xl' level='span'>
                💬
              </Text>
            </div>
            <Text className='heading-5' level='h5'>
              WhatsApp
            </Text>
            <Text className='paragraph text-greyDark text-sm' level='p'>
              Join our community and get instant support
            </Text>
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Join Community',
                className: 'text-sm',
              }}
              href='https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC'
              target='_blank'
            />
          </FlexContainer>
        </GradientContainer>
      </GridContainer>
    </Section>

    {/* Social Media & Links */}
    <Section>
      <SectionHeaderContainer
        focusText='Media'
        heading='Social'
        subtext='Connect with us on social platforms'
        className='mb-8'
      />
      <FlexContainer className='gap-6 justify-center flex-wrap'>
        <LinkButton
          buttonProps={{
            variant: 'OUTLINE',
            text: '📺 YouTube',
            className: 'flex items-center gap-2',
          }}
          href='https://www.youtube.com/@TheBoringEducation'
          target='_blank'
        />
        <LinkButton
          buttonProps={{
            variant: 'OUTLINE',
            text: '💼 LinkedIn',
            className: 'flex items-center gap-2',
          }}
          href='https://www.linkedin.com/company/theboringeducation'
          target='_blank'
        />
        <LinkButton
          buttonProps={{
            variant: 'OUTLINE',
            text: '📸 Instagram',
            className: 'flex items-center gap-2',
          }}
          href='https://www.instagram.com/theboringeducation'
          target='_blank'
        />
        <LinkButton
          buttonProps={{
            variant: 'OUTLINE',
            text: '🐙 GitHub',
            className: 'flex items-center gap-2',
          }}
          href='https://github.com/The-Boring-Education'
          target='_blank'
        />
      </FlexContainer>
    </Section>

    {/* FAQ Section */}
    <Section>
      <SectionHeaderContainer
        focusText='Questions'
        heading='Frequently Asked'
        subtext='Quick answers to common questions'
        className='mb-8'
      />
      <GridContainer className='grid-cols-1 gap-6 md:grid-cols-2'>
        <GradientContainer className='border-borderColor4 p-6'>
          <Text className='heading-6 mb-2 text-primary' level='h6'>
            How can I contribute to your open source projects?
          </Text>
          <Text className='paragraph text-greyDark text-sm' level='p'>
            Visit our GitHub repositories and look for issues labeled "good
            first issue". You can also join our WhatsApp community for guidance.
          </Text>
        </GradientContainer>

        <GradientContainer className='border-borderColor4 p-6'>
          <Text className='heading-6 mb-2 text-primary' level='h6'>
            Are your courses really free?
          </Text>
          <Text className='paragraph text-greyDark text-sm' level='p'>
            Yes! We believe in making tech education accessible to everyone.
            Most of our courses are completely free.
          </Text>
        </GradientContainer>

        <GradientContainer className='border-borderColor4 p-6'>
          <Text className='heading-6 mb-2 text-primary' level='h6'>
            How do I get interview preparation help?
          </Text>
          <Text className='paragraph text-greyDark text-sm' level='p'>
            Check out our interview prep section, join our community, and use
            our PrepYatra tool for practice questions.
          </Text>
        </GradientContainer>

        <GradientContainer className='border-borderColor4 p-6'>
          <Text className='heading-6 mb-2 text-primary' level='h6'>
            Can I collaborate with The Boring Education?
          </Text>
          <Text className='paragraph text-greyDark text-sm' level='p'>
            Absolutely! Reach out to us via email with your collaboration ideas.
            We're always open to partnerships.
          </Text>
        </GradientContainer>
      </GridContainer>
    </Section>

    {/* Call to Action */}
    <Section>
      <GradientContainer className='border-borderColor1 p-8 text-center'>
        <Text className='heading-3 mb-4 text-primary' level='h3'>
          Ready to Start Your Tech Journey?
        </Text>
        <Text
          className='paragraph mb-6 text-greyDark max-w-2xl mx-auto'
          level='p'
        >
          Don't wait! Join thousands of students who are already learning and
          growing with The Boring Education. Your success story starts here.
        </Text>
        <FlexContainer className='gap-4 justify-center flex-col sm:flex-row'>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Courses',
              className: 'w-full sm:w-auto',
            }}
            href='/shiksha'
          />
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Join Community',
              className: 'w-full sm:w-auto',
            }}
            href='https://chat.whatsapp.com/EeB7LrPRg2p3RyMOicyIAC'
            target='_blank'
          />
        </FlexContainer>
      </GradientContainer>
    </Section>
  </>
);

export default ContactCard;
