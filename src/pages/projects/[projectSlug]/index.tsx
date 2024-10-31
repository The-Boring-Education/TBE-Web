import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionLinkItem,
  FlexContainer,
  MDXRenderer,
  ProjectHeroContainer,
  ProgressBar,
  SEO,
  Section,
  Text,
} from '@/components';
import { ProjectPageProps } from '@/interfaces';
import { getProjectPageProps, getSelectedProjectChapterMeta } from '@/utils';

const ProjectPage = ({ project, meta, seoMeta, slug }: ProjectPageProps) => {
  const [projectMeta, setProjectMeta] = useState<string>(meta);
  const [completedChapters, setCompletedChapters] = useState(0);
  const totalChapters = project.sections.reduce(
    (total, section) => total + section.chapters.length,
    0
  );

  useEffect(() => {
    const completed = project.sections.reduce((count, section) => {
      return (
        count + section.chapters.filter((chapter) => chapter.isCompleted).length
      );
    }, 0);
    setCompletedChapters(completed);
  }, [project.sections]);

  const handleChapterClick = ({ sectionId, chapterId }: any) => {
    const selectedChapter = getSelectedProjectChapterMeta(
      project,
      sectionId,
      chapterId
    );

    setProjectMeta(selectedChapter);
  };

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:p-2 p-2'>
        <ProjectHeroContainer
          name={project.name}
          roadmap={project.roadmap}
          difficultyLevel={project.difficultyLevel}
        />
      </Section>
      <Section className='md:p-2 p-2'>
        <FlexContainer className='w-full gap-4' itemCenter={false}>
          <FlexContainer
            className='border md:w-3/12 w-full p-2 gap-1 rounded self-baseline'
            itemCenter={false}
            direction='col'
          >
            <Text level='h5' className='heading-5'>
              Sections
            </Text>

            {/* ProgressBar */}
            <ProgressBar
              totalChapters={totalChapters}
              completedChapters={completedChapters}
            />

            <FlexContainer justifyCenter={false} className='gap-px mt-4'>
              {project.sections.map(({ sectionId, sectionName, chapters }) => {
                return (
                  <Accordion title={sectionName} key={sectionId}>
                    {chapters.map(({ chapterId, chapterName }) => {
                      return (
                        <AccordionLinkItem
                          key={chapterId}
                          label={chapterName}
                          href={`${slug}?projectId=${project._id}&sectionId=${sectionId}&chapterId=${chapterId}`}
                          onClick={() =>
                            handleChapterClick({ sectionId, chapterId })
                          }
                        />
                      );
                    })}
                  </Accordion>
                );
              })}
            </FlexContainer>
          </FlexContainer>
          <FlexContainer
            className='border md:w-8/12 w-full p-2 rounded'
            justifyCenter={false}
            itemCenter={false}
          >
            <MDXRenderer mdxSource={projectMeta} />
          </FlexContainer>
        </FlexContainer>
      </Section>
    </React.Fragment>
  );
};

export const getServerSideProps = getProjectPageProps;

export default ProjectPage;
