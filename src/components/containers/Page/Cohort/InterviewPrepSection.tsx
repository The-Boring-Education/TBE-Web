import {
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const INTERVIEW_SESSIONS = [
  {
    title: 'Resume Building with AI',
    description:
      'Build a standout resume powered by AI to reflect your true potential.',
    icon: DocumentTextIcon,
    color: 'from-indigo-500 to-blue-500',
  },
  {
    title: 'Interview Plan with ChatGPT',
    description:
      'Create a personalized interview prep roadmap using ChatGPT prompts.',
    icon: BriefcaseIcon,
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    title: 'Mock Interviews',
    description:
      'Get real interview experience and actionable feedback from mentors.',
    icon: UserGroupIcon,
    color: 'from-rose-500 to-pink-500',
  },
];

const InterviewPrepSection = () => {
  return (
    <section className='bg-gradient-to-b from-black to-gray-900 text-white py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
          Interview Prep Phase
        </h2>
        <p className='text-gray-400 max-w-xl mx-auto mb-12'>
          Learn how to crack interviews with expert-designed prep content, mock
          sessions, and AI-powered tools.
        </p>

        <div className='grid md:grid-cols-3 gap-8'>
          {INTERVIEW_SESSIONS.map((session, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-tr ${session.color} p-6 rounded-2xl shadow-xl transition-all`}
            >
              <div className='flex items-center justify-center mb-4'>
                <session.icon className='w-10 h-10 text-white' />
              </div>
              <h3 className='text-xl font-bold mb-2 text-white'>
                {session.title}
              </h3>
              <p className='text-sm text-white/90 leading-relaxed'>
                {session.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InterviewPrepSection;
