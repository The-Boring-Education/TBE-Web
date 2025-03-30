import { Fragment, useState } from 'react';
import {
  Accordion,
  AccordionLinkItem,
  FlexContainer,
  MDXRenderer,
  ProjectHeroContainer,
  SEO,
  Section,
  Text,
  ProgressBar,
  Button,
} from '@/components';
import { ProjectPageProps } from '@/interfaces';
import { getProjectPageProps, getSelectedProjectChapterMeta } from '@/utils';
import { useAnalytics, useApi, useUser } from '@/hooks';
import { routes } from '@/constant';

const ProjectPage = ({
  project,
  meta,
  seoMeta,
  slug,
  currentChapterId,
}: ProjectPageProps) => {
  const [projectMeta, setProjectMeta] = useState<string>(meta);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial completion status for the current chapter
  const currentChapter = project.sections
    .flatMap((section) => section.chapters)
    .find((chapter) => chapter.chapterId.toString() === currentChapterId);

  const [isChapterCompleted, setIsChapterCompleted] = useState(
    currentChapter?.isCompleted || false
  );
  const [sections, setSections] = useState(project.sections);

  // Calculate total and completed chapters for the progress bar
  const totalChapters = sections.reduce(
    (total, section) => total + section.chapters.length,
    0
  );
  const completedChapters = sections.reduce(
    (completed, section) =>
      completed +
      section.chapters.filter((chapter) => chapter.isCompleted).length,
    0
  );

  const { makeRequest } = useApi(`projects/${project._id}`);
  const { user } = useUser();
  const { trackEvent } = useAnalytics();

  const handleChapterClick = ({ sectionId, chapterId }: any) => {
    const selectedChapter = getSelectedProjectChapterMeta(
      project,
      sectionId,
      chapterId
    );
    setProjectMeta(selectedChapter);
    // Update the completion status for the clicked chapter
    const clickedChapter = project.sections
      .flatMap((section) => section.chapters)
      .find((chapter) => chapter.chapterId === chapterId);
    setIsChapterCompleted(clickedChapter?.isCompleted || false);
  };

  const toggleCompletion = async () => {
    setIsLoading(true);
    try {
      const newCompletionStatus = !isChapterCompleted;

      await makeRequest({
        method: 'PATCH',
        url: routes.api.markProjectChapterAsCompleted,
        body: {
          userId: user?.id,
          projectId: project._id,
          sectionId: sections.find((section) =>
            section.chapters.some((chap) => chap.chapterId === currentChapterId)
          )?.sectionId,
          chapterId: currentChapterId,
          isCompleted: newCompletionStatus,
        },
      });

      trackEvent({
        action: 'PROJECT_PROGRESS',
        category: 'Project',
        label: 'Project Progress',
        value: {
          userId: user?.id,
          projectId: project._id,
          chapterId: currentChapterId,
        },
      });

      // Update chapter completion status in state
      setSections((prevSections) =>
        prevSections.map((section) => ({
          ...section,
          chapters: section.chapters.map((chapter) =>
            chapter.chapterId === currentChapterId
              ? { ...chapter, isCompleted: newCompletionStatus }
              : chapter
          ),
        }))
      );

      setIsChapterCompleted(newCompletionStatus);

      if (newCompletionStatus) {
        const allChapters = sections.flatMap((section) => section.chapters);

        const currentIndex = allChapters.findIndex(
          (chapter) => chapter.chapterId === currentChapterId
        );

        const nextUncompleted = allChapters
          .slice(currentIndex + 1)
          .find((chapter) => !chapter.isCompleted);

        const previousUncompleted = allChapters
          .slice(0, currentIndex)
          .reverse()
          .find((chapter) => !chapter.isCompleted);

        const targetChapter = nextUncompleted || previousUncompleted;

        if (targetChapter) {
          const targetSectionId = sections.find((section) =>
            section.chapters.some(
              (chap) => chap.chapterId === targetChapter.chapterId
            )
          )?.sectionId;

          window.location.href = `${slug}?projectId=${project._id}&sectionId=${targetSectionId}&chapterId=${targetChapter.chapterId}`;
        }
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
          id={project._id}
          name={project.name}
          roadmap={project.roadmap}
          difficultyLevel={project.difficultyLevel}
          isEnrolled={project.isEnrolled}
        />
      </Section>
      <Section className='p-2'>
        <FlexContainer className='w-full gap-4' itemCenter={false}>
          {/* Sidebar with Progress Bar and Chapters */}
          <FlexContainer
            className='border md:w-3/12 w-full px-2 gap-1 rounded self-baseline max-h-[80vh] overflow-y-auto bg-white'
            itemCenter={false}
          >
            <div className='w-full sticky top-0 bg-inherit py-2'>
              <Text level='h5' className='heading-5'>
                Sections
              </Text>

              {/* ProgressBar */}
              <ProgressBar
                totalChapters={totalChapters}
                completedChapters={completedChapters}
              />
            </div>

            <FlexContainer justifyCenter={false} className='gap-px'>
              {sections.map(({ sectionId, sectionName, chapters }) => (
                <Accordion title={sectionName} key={sectionId}>
                  {chapters.map(({ chapterId, chapterName, isCompleted }) => {
                    const isActive = chapterId === currentChapterId;

                    return (
                      <AccordionLinkItem
                        key={chapterId}
                        isActive={isActive}
                        label={chapterName}
                        isCompleted={isCompleted}
                        href={`${slug}?projectId=${project._id}&sectionId=${sectionId}&chapterId=${chapterId}`}
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
            justifyCenter={false}
            itemCenter={false}
            disabled={!project.isEnrolled}
          >
            <MDXRenderer
              mdxSource={projectMeta}
              actions={[
                currentChapterId && (
                  <Button
                    key='enroll'
                    variant={
                      isChapterCompleted
                        ? 'SUCCESS'
                        : isLoading
                        ? 'SECONDARY'
                        : 'PRIMARY'
                    }
                    text={
                      isLoading
                        ? 'Marking...'
                        : isChapterCompleted
                        ? 'Completed'
                        : 'Mark As Completed'
                    }
                    className='w-fit'
                    onClick={toggleCompletion}
                    isLoading={isLoading}
                  />
                ),
              ]}
            />
          </FlexContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getProjectPageProps;

export default ProjectPage;
