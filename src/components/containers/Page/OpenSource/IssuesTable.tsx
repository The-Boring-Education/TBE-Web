import { motion } from 'framer-motion';

import { FlexContainer, Image, LoadingSpinner, Text } from '@/components';
import type { IssuesTableProps } from '@/interfaces';
import { formatIssueDate, getLabelColor } from '@/utils/github';

const IssuesTable = ({
  issues,
  repository,
  loading,
  error,
  onRetry,
}: IssuesTableProps) => {
  if (loading) {
    return (
      <div className='bg-white rounded-b-xl border-t-0 shadow-lg p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <LoadingSpinner height={8} width={8} className='text-primary' />
          <Text className='text-gray-600' level='p'>
            Loading issues from {repository.name}...
          </Text>
        </FlexContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-b-xl border-t-0 shadow-lg p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text className='text-red-600 text-center' level='p'>
            {error}
          </Text>
          <button
            onClick={onRetry}
            className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Try Again
          </button>
        </FlexContainer>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className='bg-white rounded-b-xl border-t-0 shadow-lg p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text className='text-gray-600 text-center text-lg' level='p'>
            🎉 No open issues found!
          </Text>
          <Text className='text-gray-500 text-center' level='p'>
            All issues have been resolved or this repository doesn't have any
            open issues yet.
          </Text>
        </FlexContainer>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-b-xl border-t-0 shadow-lg overflow-hidden'>
      {/* Table Header */}
      <div className='bg-gray-50 border-b border-gray-200 px-6 py-4'>
        <FlexContainer justifyCenter={false} className='gap-4'>
          <Text
            level='span'
            className='font-semibold text-gray-700 text-sm uppercase tracking-wider'
          >
            {issues.length} Open Issues
          </Text>
          <Text level='span' className='text-gray-500 text-sm'>
            • Showing contributor-friendly issues
          </Text>
        </FlexContainer>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Issue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Author
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Labels
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Comments
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Opened
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {issues.map((issue, index) => (
              <motion.tr
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='hover:bg-gray-50 transition-colors'
              >
                {/* Issue Title & Number */}
                <td className='px-6 py-4'>
                  <FlexContainer
                    direction='col'
                    itemCenter={false}
                    className='gap-1'
                  >
                    <a
                      href={issue.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-gray-900 font-medium hover:text-primary transition-colors line-clamp-2'
                    >
                      {issue.title}
                    </a>
                    <Text level='span' className='text-sm text-gray-500'>
                      #{issue.number}
                    </Text>
                  </FlexContainer>
                </td>

                {/* Author */}
                <td className='px-6 py-4'>
                  <FlexContainer itemCenter className='gap-3'>
                    <Image
                      alt={`${issue.user.login} avatar`}
                      className='w-8 h-8 rounded-full'
                      src={issue.user.avatar_url}
                      loading='lazy'
                    />
                    <a
                      href={issue.user.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-gray-900 hover:text-primary transition-colors'
                    >
                      {issue.user.login}
                    </a>
                  </FlexContainer>
                </td>

                {/* Labels */}
                <td className='px-6 py-4'>
                  <FlexContainer className='gap-1 flex-wrap'>
                    {issue.labels.slice(0, 3).map((label) => (
                      <span
                        key={label.id}
                        className='px-2 py-1 rounded-full text-xs font-medium text-white'
                        style={{
                          backgroundColor:
                            `#${label.color}` || getLabelColor(label.name),
                          fontSize: '0.65rem',
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {issue.labels.length > 3 && (
                      <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700'>
                        +{issue.labels.length - 3}
                      </span>
                    )}
                  </FlexContainer>
                </td>

                {/* Comments */}
                <td className='px-6 py-4'>
                  <FlexContainer itemCenter className='gap-1'>
                    <Text level='span' className='text-gray-600'>
                      💬
                    </Text>
                    <Text level='span' className='text-gray-900 font-medium'>
                      {issue.comments}
                    </Text>
                  </FlexContainer>
                </td>

                {/* Opened Date */}
                <td className='px-6 py-4'>
                  <Text level='span' className='text-gray-600 text-sm'>
                    {formatIssueDate(issue.created_at)}
                  </Text>
                </td>

                {/* Action */}
                <td className='px-6 py-4'>
                  <a
                    href={issue.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors'
                  >
                    View Issue
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className='bg-gray-50 border-t border-gray-200 px-6 py-4'>
        <FlexContainer justifyCenter className='gap-2'>
          <Text className='text-gray-600 text-sm text-center' level='p'>
            Want to see more issues?{' '}
            <a
              href={`${repository.url}/issues`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline font-medium'
            >
              Visit {repository.name} on GitHub
            </a>
          </Text>
        </FlexContainer>
      </div>
    </div>
  );
};

export default IssuesTable;
