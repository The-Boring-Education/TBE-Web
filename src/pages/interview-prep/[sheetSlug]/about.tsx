import { Fragment, useMemo, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

import {
  Button,
  FlexContainer,
  LinkButton,
  MDXRenderer,
  PaymentCard,
  QuestionLink,
  Section,
  SEO,
  SheetHeroContainer,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { usePaymentStatus, useUser } from '@/hooks';
import type { SheetPageProps } from '@/interfaces';
import { getSheetPageProps } from '@/utils';

const SheetAboutPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: sheet?._id,
    isPremium: sheet?.isPremium,
  });

  const previewQuestions = useMemo(() => (sheet?.questions || []).slice(0, 3), [sheet?.questions]);
  const lockedQuestions = useMemo(() => (sheet?.questions || []).slice(3), [sheet?.questions]);

  const isLocked = sheet?.isPremium && !sheet?.isEnrolled && isPurchased === false;

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const startNowHref = sheet?.questions?.[0]?._id ? `${routes.interviewPrep}/${sheet.slug}` : routes.interviewPrep;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:p-2 p-2'>
        <SheetHeroContainer
          id={sheet._id ?? ''}
          isEnrolled={sheet.isEnrolled}
          name={sheet.name ?? ''}
          isPremium={sheet.isPremium}
          isPurchased={!!isPurchased}
          redirectTo={`${routes.interviewPrep}/${sheet.slug}`}
        />
      </Section>

      <Section className='md:p-2 p-2'>
        <FlexContainer className='w-full gap-6' itemCenter={false}>
          <FlexContainer className='md:w-7/12 w-full p-3 rounded border bg-white' itemCenter={false}>
            <Text className='heading-5 mb-2' level='h2'>About this Sheet</Text>
            <MDXRenderer mdxSource={sheet.meta || meta || ''} />

            {sheet?.features && sheet.features.length > 0 && (
              <div className='mt-4'>
                <Text className='heading-6 mb-2' level='h3'>What you get</Text>
                <ul className='list-disc ml-6 text-sm text-greyDark'>
                  {sheet.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {sheet?.isPremium && (
              <div className='mt-6 rounded bg-yellow-50 p-4 border border-yellow-200'>
                <Text level='h4' className='mb-2'>Pricing</Text>
                <Text level='p' className='text-greyDark'>
                  Access full content for just <b>₹{sheet.price}</b>. Lifetime access, regular updates.
                </Text>
                {!showPayment && !sheet.isEnrolled && (
                  <Button className='w-fit mt-3' text='Pay to Unlock' variant='PRIMARY' onClick={handleShowPayment} />
                )}
              </div>
            )}

            {showPayment && (
              <div ref={paymentSectionRef} className='mt-4'>
                <PaymentCard course={sheet} onClose={() => setShowPayment(false)} productType='INTERVIEW_SHEET' />
              </div>
            )}
          </FlexContainer>

          <FlexContainer className='md:w-5/12 w-full gap-3' itemCenter={false}>
            <div className='w-full rounded border bg-white p-3'>
              <Text className='heading-6 mb-2' level='h3'>Preview Questions</Text>
              <FlexContainer className='gap-1' itemCenter={false}>
                {previewQuestions.map((q) => (
                  <QuestionLink
                    key={q._id.toString()}
                    href={startNowHref}
                    questionId={q._id.toString()}
                    title={q.title}
                    question={`${q.question}\n\n${q.answer}`}
                    isCompleted={false}
                    currentQuestionId={''}
                    frequency={q.frequency}
                    handleQuestionClick={() => {}}
                    isLocked={false}
                  />
                ))}
              </FlexContainer>
            </div>

            {lockedQuestions.length > 0 && (
              <div className='w-full rounded border bg-white p-3'>
                <Text className='heading-6 mb-2' level='h3'>Locked Content</Text>
                <FlexContainer className='gap-1' itemCenter={false}>
                  {lockedQuestions.slice(0, 6).map((q) => (
                    <div key={q._id.toString()} className='flex items-center w-full'>
                      <QuestionLink
                        href={startNowHref}
                        questionId={q._id.toString()}
                        title={q.title}
                        question={`${q.question}\n\n${q.answer}`}
                        isCompleted={false}
                        currentQuestionId={''}
                        frequency={q.frequency}
                        handleQuestionClick={() => {}}
                        isLocked={isLocked}
                      />
                    </div>
                  ))}
                </FlexContainer>
                {isLocked && (
                  <div className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
                    <FaLock /> Unlock all questions by enrolling.
                  </div>
                )}
              </div>
            )}

            <FlexContainer>
              <LinkButton
                href={startNowHref}
                buttonProps={{ variant: 'PRIMARY', text: sheet.isEnrolled || !isLocked ? 'Start Now' : 'View First Question' }}
              />
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetAboutPage;

