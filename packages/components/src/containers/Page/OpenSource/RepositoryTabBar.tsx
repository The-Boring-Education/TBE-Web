import { motion } from 'framer-motion';

import { FlexContainer, Text } from '@tbe/components';
import { REPOSITORY_TAB_CONFIG } from '@tbe/constants';
import type { RepositoryTabBarProps } from '@tbe/interface';

const RepositoryTabBar = ({
  repositories,
  activeRepository,
  onRepositoryChange,
}: RepositoryTabBarProps) => (
  <div className='w-full border-b border-gray-200 bg-white rounded-t-xl'>
    <FlexContainer className='px-6 pt-6 pb-0' wrap>
      {repositories.map((repository) => {
        const isActive = activeRepository.repo === repository.repo;
        const config =
          REPOSITORY_TAB_CONFIG[
            repository.repo as keyof typeof REPOSITORY_TAB_CONFIG
          ];

        return (
          <motion.button
            key={repository.repo}
            onClick={() => onRepositoryChange(repository)}
            className={`
                relative px-6 py-3 mx-1 rounded-t-lg transition-all duration-200 focus:outline-none
                ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FlexContainer itemCenter className='gap-2'>
              <Text level='span' className='text-lg'>
                {config?.icon || '📂'}
              </Text>
              <FlexContainer direction='col' itemCenter={false}>
                <Text
                  level='span'
                  className={`font-semibold text-sm ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {config?.displayName || repository.name}
                </Text>
                <Text
                  level='span'
                  className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  {repository.language}
                </Text>
              </FlexContainer>
            </FlexContainer>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                className='absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full'
                layoutId='activeTab'
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </FlexContainer>

    {/* Repository description */}
    <div className='px-6 py-3 bg-gray-50 border-t border-gray-100'>
      <FlexContainer itemCenter className='gap-3'>
        <Text level='span' className='text-2xl'>
          {REPOSITORY_TAB_CONFIG[
            activeRepository.repo as keyof typeof REPOSITORY_TAB_CONFIG
          ]?.icon || '📂'}
        </Text>
        <FlexContainer direction='col' itemCenter={false} className='flex-1'>
          <Text level='span' className='font-semibold text-gray-900'>
            {activeRepository.name}
          </Text>
          <Text level='span' className='text-sm text-gray-600'>
            {activeRepository.description}
          </Text>
        </FlexContainer>
        <a
          href={activeRepository.url}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
        >
          View on GitHub
        </a>
      </FlexContainer>
    </div>
  </div>
);

export default RepositoryTabBar;
