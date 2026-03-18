import {
  Accordion,
  AccordionLinkItem,
  Button,
  FeedbackPopup,
  FlexContainer,
  LinerProgressBar,
  MDXRenderer,
  ProjectHeroContainer,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import { useGamifiedAction } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useAnalytics, useUser } from '@tbe/hooks';
import type { ProjectPageProps } from '@tbe/interface';
import { useMutation } from '@tbe/query';
import {
  getProjectPageProps,
  getSelectedProjectChapterMeta,
  sendRequest,
} from '@tbe/utils';
import { Fragment, useEffect, useRef, useState } from 'react';

const ProjectPage = ({
  project,
  meta,
  seoMeta,
  slug,
  currentChapterId,
}: ProjectPageProps) => {
  const [projectMeta, setProjectMeta] = useState<string>(meta);
  const [sections, setSections] = useState(project.sections);
  const firstSection = sections?.[0];
  const firstChapter = firstSection?.chapters?.[0];
  const firstChapterId = firstChapter?.chapterId?.toString() || '';
  const [currentChapterIdState, setCurrentChapterIdState] = useState(
    currentChapterId || firstChapterId,
  );
  const [isChapterCompleted, setIsChapterCompleted] = useState(
    sections
      .flatMap((section) => section.chapters)
      .find((chapter) => chapter.chapterId.toString() === currentChapterIdState)
      ?.isCompleted,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showChapterFeedback, setShowChapterFeedback] = useState(false);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Calculate total and completed chapters for the progress bar
  const totalChapters = sections.reduce(
    (total, section) => total + section.chapters.length,
    0,
  );
  const completedChapters = sections.reduce(
    (completed, section) =>
      completed +
      section.chapters.filter((chapter) => chapter.isCompleted).length,
    0,
  );

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  useEffect(() => {
    const currentChapter = sections
      .flatMap((section) => section.chapters)
      .find(
        (chapter) => chapter.chapterId.toString() === currentChapterIdState,
      );

    setIsChapterCompleted(currentChapter?.isCompleted);

    if (currentChapter) {
      setProjectMeta(currentChapter.content);
    }

    // Show feedback popup if all chapters are completed
    const allCompleted =
      sections.length > 0 &&
      sections.every((section) =>
        section.chapters.every((chapter) => chapter.isCompleted),
      );

    if (allCompleted && !showChapterFeedback) {
      // Trigger project completion celebration
      gamifiedAction.triggerGamifiedAction({
        gamificationAction: 'COMPLETE_PROJECT_CHAPTER',
        analytics: {
          action: 'PROJECT_COMPLETE',
          category: 'Achievement',
          label: 'Project Completed',
        },
        celebrationType: 'achievement',
        customMessage: 'Congratulations! Project completed!',
        metadata: {
          projectId: project._id,
          projectName: project.name,
          totalChapters,
        },
      });
    }

    setShowChapterFeedback(allCompleted);
  }, [
    currentChapterIdState,
    sections,
    project._id,
    project.name,
    totalChapters,
    showChapterFeedback,
    gamifiedAction,
  ]);

  // Initialize state when component mounts
  useEffect(() => {
    if (sections.length > 0 && currentChapterId) {
      const currentChapter = sections
        .flatMap((section) => section.chapters)
        .find((chapter) => chapter.chapterId.toString() === currentChapterId);

      if (currentChapter) {
        setIsChapterCompleted(currentChapter.isCompleted);
        setProjectMeta(currentChapter.content);
        setCurrentChapterIdState(currentChapterId);
      }
    }
  }, [sections, currentChapterId]);

  const handleChapterClick = ({ sectionId, chapterId }: any) => {
    console.log('Chapter clicked:', { sectionId, chapterId });

    const selectedChapter = getSelectedProjectChapterMeta(
      project,
      sectionId,
      chapterId,
    );

    console.log('Selected chapter content:', !!selectedChapter);

    setProjectMeta(selectedChapter);
    setCurrentChapterIdState(chapterId);

    // Update the completion status for the clicked chapter
    const clickedChapter = sections
      .flatMap((section) => section.chapters)
      .find((chapter) => chapter.chapterId.toString() === chapterId);

    console.log('Clicked chapter found:', clickedChapter);

    setIsChapterCompleted(clickedChapter?.isCompleted || false);
  };

  const handleFeedbackComplete = () => {
    setShowChapterFeedback(false);
  };

  const toggleCompletion = async () => {
    setIsLoading(true);
    try {
      const newCompletionStatus = !isChapterCompleted;

      const response = await makeRequest({
        method: 'PATCH',
        url: routes.api.markProjectChapterAsCompleted,
        body: {
          userId: user?.id,
          projectId: project._id,
          sectionId: sections.find((section) =>
            section.chapters.some(
              (chap) => chap.chapterId === currentChapterIdState,
            ),
          )?.sectionId,
          chapterId: currentChapterIdState,
          isCompleted: newCompletionStatus,
        },
      });

      // Only proceed if the API call was successful
      if (response?.status) {
        // Fire gamified action on completion
        if (newCompletionStatus) {
          await gamifiedAction.triggerGamifiedAction({
            gamificationAction: 'COMPLETE_PROJECT_CHAPTER',
            analytics: {
              action: 'PROJECT_CHAPTER_COMPLETE',
              category: 'Learning',
              label: 'Project Chapter Completed',
            },
            customMessage: 'Project chapter completed! Keep building!',
            metadata: {
              projectId: project._id,
              chapterId: currentChapterIdState,
              projectName: project.name,
            },
          });
        } else {
          trackEvent({
            action: 'PROJECT_PROGRESS',
            category: 'Project',
            label: 'Project Progress',
            value: {
              userId: user?.id,
              projectId: project._id,
              chapterId: currentChapterIdState,
            },
          });
        }

        // Update chapter completion status in state
        const updatedSections = sections.map((section) => ({
          ...section,
          chapters: section.chapters.map((chapter) =>
            chapter.chapterId === currentChapterIdState
              ? { ...chapter, isCompleted: newCompletionStatus }
              : chapter,
          ),
        }));

        setSections(updatedSections);
        setIsChapterCompleted(newCompletionStatus);

        // Move to next chapter if completed
        if (newCompletionStatus) {
          // Use the updated sections to find the next chapter
          const allChapters = updatedSections.flatMap(
            (section) => section.chapters,
          );

          console.log('Finding next chapter:', {
            currentChapterIdState,
            allChapters: allChapters.map((c) => ({
              id: c.chapterId,
              name: c.chapterName,
              completed: c.isCompleted,
            })),
          });

          const currentIndex = allChapters.findIndex(
            (chapter) => chapter.chapterId.toString() === currentChapterIdState,
          );

          console.log('Current chapter index:', currentIndex);

          const next =
            allChapters
              .slice(currentIndex + 1)
              .find((chapter) => !chapter.isCompleted) ||
            allChapters.find((chapter) => !chapter.isCompleted); // Loop to beginning if none left

          console.log('Next chapter found:', next);

          if (next) {
            const chapterId = next.chapterId.toString();
            console.log('Setting next chapter ID:', chapterId);

            setCurrentChapterIdState(chapterId);

            // Find the section that contains the next chapter
            const nextSection = updatedSections.find((section) =>
              section.chapters.some(
                (chap) => chap.chapterId.toString() === chapterId,
              ),
            );

            console.log('Next section found:', nextSection?.sectionName);

            if (nextSection) {
              // Find the next chapter content directly from the updated sections
              const nextChapter = nextSection.chapters.find(
                (chap) => chap.chapterId.toString() === chapterId,
              );

              console.log(
                'Next chapter content found:',
                !!nextChapter?.content,
              );

              if (nextChapter) {
                setProjectMeta(nextChapter.content);

                // Auto-scroll to content section for better UX
                setTimeout(() => {
                  contentSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }, 100);
              }
            }
          } else {
            console.log('No next chapter found');
          }

          // Show feedback popup for chapter completion
          setShowChapterFeedback(true);
        }
      } else {
        // Handle API error - don't update local state
        console.error(
          'Failed to update chapter completion:',
          response?.message,
        );
      }
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='p-2 lg:px-8'>
        <ProjectHeroContainer
          difficultyLevel={project.difficultyLevel}
          id={project._id}
          isEnrolled={project.isEnrolled}
          name={project.name}
          roadmap={project.roadmap}
        />
      </Section>
      <Section id='project-content' className='p-2'>
        <div ref={contentSectionRef}>
          <FlexContainer className='w-full gap-4' itemCenter={false}>
            {/* Sidebar with Progress Bar and Chapters */}
            <FlexContainer
              className='border md:w-3/12 w-full px-2 gap-1 rounded self-baseline max-h-[80vh] overflow-y-auto bg-white'
              itemCenter={false}
            >
              <div className='w-full sticky top-0 bg-inherit py-2'>
                <Text className='heading-5' level='h5'>
                  Sections
                </Text>

                {/* LinerProgressBar */}
                <LinerProgressBar
                  completedChapters={completedChapters}
                  totalChapters={totalChapters}
                />
              </div>

              <FlexContainer className='gap-px' justifyCenter={false}>
                {sections.map(({ sectionId, sectionName, chapters }) => (
                  <Accordion key={sectionId} title={sectionName}>
                    {chapters.map(({ chapterId, chapterName, isCompleted }) => {
                      const isActive = chapterId === currentChapterIdState;

                      return (
                        <AccordionLinkItem
                          key={chapterId}
                          href='#'
                          isActive={isActive}
                          isCompleted={isCompleted}
                          label={chapterName}
                          onClick={() =>
                            handleChapterClick({ sectionId, chapterId })
                          }
                        />
                      );
                    })}
                  </Accordion>
                ))}
              </FlexContainer>
            </FlexContainer>

            {/* Main Content Area */}
            <FlexContainer
              className='border md:w-8/12 w-full p-2 rounded'
              disabled={!project.isEnrolled}
              itemCenter={false}
              justifyCenter={false}
            >
              <MDXRenderer
                actions={[
                  currentChapterIdState && (
                    <Button
                      key='complete'
                      className='w-fit mt-2'
                      isLoading={isLoading}
                      disabled={!project.isEnrolled}
                      text={
                        isLoading
                          ? 'Marking...'
                          : isChapterCompleted
                            ? 'Completed'
                            : 'Mark As Completed'
                      }
                      variant={
                        isChapterCompleted
                          ? 'SUCCESS'
                          : isLoading
                            ? 'SECONDARY'
                            : 'PRIMARY'
                      }
                      onClick={toggleCompletion}
                    />
                  ),
                ]}
                mdxSource={projectMeta}
              />
            </FlexContainer>
          </FlexContainer>
        </div>
      </Section>
      {showChapterFeedback && (
        <FeedbackPopup
          refId={currentChapterIdState}
          type='GENERAL'
          onSubmit={handleFeedbackComplete}
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getProjectPageProps;

export default ProjectPage;
