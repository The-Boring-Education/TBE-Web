import { motion } from 'framer-motion';

import { FlexContainer, Image, Link, Text } from '@/components';
import type { GitHubIssueCardProps } from '@/interfaces';
import { formatIssueDate, getLabelColor } from '@/utils/github';

const GitHubIssueCard = ({ issue, repository }: GitHubIssueCardProps) => {
  const formattedDate = formatIssueDate(issue.created_at);
  const maxLabelsToShow = 3;
  const displayLabels = issue.labels.slice(0, maxLabelsToShow);
  const remainingLabels = issue.labels.length - maxLabelsToShow;

  return (
    <motion.div
      className='h-full'
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col'>
        {/* Header */}
        <FlexContainer className='mb-4' itemCenter justifyCenter={false}>
          <Image
            alt={`${issue.user.login} avatar`}
            className='w-8 h-8 rounded-full mr-3'
            src={issue.user.avatar_url}
            loading='lazy'
          />
          <FlexContainer direction='col' className='flex-1 min-w-0'>
            <Text className='text-sm text-gray-600 truncate' level='span'>
              #{issue.number} • {formattedDate}
            </Text>
            <Text className='text-sm text-gray-500 truncate' level='span'>
              by {issue.user.login}
            </Text>
          </FlexContainer>
        </FlexContainer>

        {/* Title */}
        <Text
          className='text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight'
          level='h3'
        >
          {issue.title}
        </Text>

        {/* Description */}
        {issue.body && (
          <Text
            className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1'
            level='p'
          >
            {issue.body.replace(/[#*`]/g, '').substring(0, 120)}
            {issue.body.length > 120 ? '...' : ''}
          </Text>
        )}

        {/* Labels */}
        {displayLabels.length > 0 && (
          <FlexContainer className='mb-4 flex-wrap gap-2'>
            {displayLabels.map((label) => (
              <span
                key={label.id}
                className='px-2 py-1 rounded-full text-xs font-medium text-white'
                style={{
                  backgroundColor:
                    `#${label.color}` || getLabelColor(label.name),
                  fontSize: '0.7rem',
                }}
              >
                {label.name}
              </span>
            ))}
            {remainingLabels > 0 && (
              <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700'>
                +{remainingLabels}
              </span>
            )}
          </FlexContainer>
        )}

        {/* Footer */}
        <FlexContainer className='mt-auto' itemCenter justifyCenter={false}>
          <FlexContainer className='flex-1' itemCenter>
            <Text className='text-sm text-gray-500 mr-4' level='span'>
              💬 {issue.comments}
            </Text>
            <Text className='text-sm text-gray-500' level='span'>
              {repository.name}
            </Text>
          </FlexContainer>
          <Link
            href={issue.html_url}
            target='_blank'
            className='bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
          >
            View Issue
          </Link>
        </FlexContainer>
      </div>
    </motion.div>
  );
};

export default GitHubIssueCard;
