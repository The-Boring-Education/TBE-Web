import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

type Project = {
  title: string;
  description: string;
  student: string;
  link?: string;
};

const prevProjects: Project[] = [
  {
    title: 'Swanik',
    description: 'A Platform for Stray Dog Adoption and Care Management.',
    student: 'Khushi Verma',
  },
  {
    title: 'Paropkar',
    description: 'A platform for donating and receiving used items.',
    student: 'Shuchita Trivedi',
  },
  {
    title: 'PlaySync',
    description: 'PlaySync allows to Jam YouTube videos with friends.',
    student: 'Abhishek Raut',
  },
  {
    title: 'Rajneeti',
    description: 'An app that allows to make better voting choices.',
    student: 'Karan Dixit',
  },
  {
    title: 'Twacha',
    description: 'Twacha helps you Build Your Personal Skin Care Routine.',
    student: 'Anurag Tiwari',
  },
  {
    title: 'GrupMate',
    description: 'A Discussion Forum for College Students',
    student: 'Alok Kumar Singh',
  },
];

const PrevCohortProjects = () => {
  return (
    <section className='bg-gradient-to-br from-gray-900 to-black py-20 px-6 text-white'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-fuchsia-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent'>
          Previous Cohort Projects
        </h2>
        <p className='text-gray-400 max-w-2xl mx-auto mb-12'>
          These are real projects built by our past cohort learners during their
          journey.
        </p>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {prevProjects.map((project, idx) => (
            <div
              key={idx}
              className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 hover:scale-105 transition-all relative'
            >
              <div className='mb-4'>
                <h3 className='text-xl font-semibold'>{project.title}</h3>
                <p className='text-sm text-gray-300'>{project.description}</p>
              </div>
              <p className='text-xs text-gray-400 italic'>
                — {project.student}
              </p>
              {project.link && (
                <a
                  href={project.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute top-4 right-4 text-white hover:text-indigo-400'
                >
                  <ArrowTopRightOnSquareIcon className='w-5 h-5' />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrevCohortProjects;
