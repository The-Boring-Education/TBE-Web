// TODO: Refactor this component to use a more generic approach for session details
import {
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';

const sessions = [
  {
    title: 'Project Building Phase',
    description:
      'Build and validate your product idea with personalized guidance.',
    gradient: 'from-indigo-500 to-purple-600',
    icon: <UsersIcon className='w-8 h-8 text-secondary' />,
    items: [
      {
        title: 'Weekly 1:1 Sessions',
        icon: <UserGroupIcon className='w-6 h-6 text-indigo-300' />,
        desc: 'Private mentoring sessions to push your project forward.',
      },
      {
        title: 'Product Roundtables',
        icon: (
          <ChatBubbleBottomCenterTextIcon className='w-6 h-6 text-indigo-300' />
        ),
        desc: 'Collaborate, share insights, and solve challenges with peers.',
      },
    ],
  },
  {
    title: 'Interview Prep Phase',
    description:
      'Master interview skills with the right tools and expert feedback.',
    gradient: 'from-pink-500 to-red-500',
    icon: <ClipboardDocumentCheckIcon className='w-8 h-8 text-secondary' />,
    items: [
      {
        title: 'AI Resume Building',
        icon: <DocumentTextIcon className='w-6 h-6 text-pink-300' />,
        desc: 'Craft a standout resume using AI suggestions.',
      },
      {
        title: 'Interview Plan with ChatGPT',
        icon: <SparklesIcon className='w-6 h-6 text-pink-300' />,
        desc: 'Structured preparation mapped to your experience.',
      },
      {
        title: 'Mock Interviews',
        icon: (
          <ChatBubbleBottomCenterTextIcon className='w-6 h-6 text-pink-300' />
        ),
        desc: 'Simulated interviews with detailed mentor feedback.',
      },
    ],
  },
];

const SessionDetailsSection = () => {
  return (
    <section className='bg-gradient-to-b from-gray-950 to-black text-white py-20 px-4'>
      <div className='max-w-6xl mx-auto'>
        <h2 className='text-4xl font-bold text-center mb-4 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent'>
          Our Live Sessions
        </h2>
        <p className='text-center text-gray-300 mb-12'>
          Here’s everything you’ll receive during the cohort.
        </p>
        <div className='grid md:grid-cols-2 gap-10'>
          {sessions.map((phase, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-xl bg-gradient-to-br ${phase.gradient} transform transition hover:scale-105`}
            >
              <div className='flex items-center gap-4 mb-5'>
                <div className='p-2 bg-white rounded-full'>{phase.icon}</div>
                <div>
                  <h3 className='text-xl font-bold'>{phase.title}</h3>
                  <p className='text-sm text-white/90'>{phase.description}</p>
                </div>
              </div>
              <ul className='space-y-4'>
                {phase.items.map((item, i) => (
                  <li key={i} className='flex items-start gap-3'>
                    <div>{item.icon}</div>
                    <div>
                      <h4 className='text-lg font-semibold'>{item.title}</h4>
                      <p className='text-sm text-white/80'>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SessionDetailsSection;
