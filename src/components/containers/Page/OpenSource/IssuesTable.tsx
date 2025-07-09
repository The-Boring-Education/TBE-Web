import { motion } from 'framer-motion';

import { FlexContainer, Image, Link, LoadingSpinner, Text } from '@/components';
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
      <div className='bg-white rounded-xl md:rounded-b-xl md:border-t-0 shadow-lg p-8 md:p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <LoadingSpinner height={8} width={8} className='text-primary' />
          <Text
            className='text-gray-600 text-center text-sm md:text-base'
            level='p'
          >
            Loading issues from {repository.name}...
          </Text>
        </FlexContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl md:rounded-b-xl md:border-t-0 shadow-lg p-8 md:p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text
            className='text-red-600 text-center text-sm md:text-base'
            level='p'
          >
            {error}
          </Text>
          <button
            onClick={onRetry}
            className='bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium'
          >
            Try Again
          </button>
        </FlexContainer>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className='bg-white rounded-xl md:rounded-b-xl md:border-t-0 shadow-lg p-8 md:p-16'>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text
            className='text-gray-600 text-center text-lg md:text-xl'
            level='p'
          >
            🎉 No open issues found!
          </Text>
          <Text
            className='text-gray-500 text-center text-sm md:text-base'
            level='p'
          >
            All issues have been resolved or this repository doesn't have any
            open issues yet.
          </Text>
        </FlexContainer>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl md:rounded-b-xl md:border-t-0 shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-gray-50 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4'>
        <FlexContainer
          justifyCenter={false}
          className='gap-2 md:gap-4 flex-col sm:flex-row'
        >
          <Text
            level='span'
            className='font-semibold text-gray-700 text-xs md:text-sm uppercase tracking-wider'
          >
            {issues.length} Open Issues
          </Text>
          <Text level='span' className='text-gray-500 text-xs md:text-sm'>
            • Showing contributor-friendly issues
          </Text>
        </FlexContainer>
      </div>

      {/* Mobile Card Layout (< md) */}
      <div className='block md:hidden'>
        <div className='divide-y divide-gray-200'>
          {issues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='p-4 hover:bg-gray-50 transition-colors'
            >
              {/* Issue Title & Number */}
              <div className='mb-3'>
                <a
                  href={issue.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-900 font-medium hover:text-primary transition-colors block mb-1 text-sm leading-5'
                >
                  {issue.title}
                </a>
                <Text level='span' className='text-xs text-gray-500'>
                  #{issue.number}
                </Text>
              </div>

              {/* Author & Date */}
              <FlexContainer
                itemCenter
                justifyCenter={false}
                className='gap-3 mb-3'
              >
                <FlexContainer itemCenter className='gap-2'>
                  <Link
                    href={issue.user.html_url}
                    target='_blank'
                    className='text-gray-700 hover:text-primary transition-colors text-sm font-medium'
                  >
                    <Image
                      alt={`${issue.user.login} avatar`}
                      className='w-6 h-6 rounded-full'
                      src={issue.user.avatar_url}
                      loading='lazy'
                      fullWidth={false}
                      fullHeight={false}
                    />
                  </Link>
                </FlexContainer>
                <Text level='span' className='text-gray-500 text-xs'>
                  {formatIssueDate(issue.created_at)}
                </Text>
              </FlexContainer>

              {/* Labels */}
              <FlexContainer className='gap-1 flex-wrap mb-3'>
                {issue.labels.slice(0, 4).map((label) => (
                  <span
                    key={label.id}
                    className='px-2 py-1 rounded-full text-xs font-medium text-white'
                    style={{
                      backgroundColor:
                        `#${label.color}` || getLabelColor(label.name),
                      fontSize: '0.6rem',
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {issue.labels.length > 4 && (
                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700'>
                    +{issue.labels.length - 4}
                  </span>
                )}
              </FlexContainer>

              {/* Comments & Action */}
              <FlexContainer itemCenter justifyCenter={false} className='gap-4'>
                <FlexContainer itemCenter className='gap-1'>
                  <Text level='span' className='text-gray-600 text-sm'>
                    💬
                  </Text>
                  <Text
                    level='span'
                    className='text-gray-700 font-medium text-sm'
                  >
                    {issue.comments}
                  </Text>
                </FlexContainer>
                <Link
                  href={issue.html_url}
                  target='_blank'
                  className='bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors ml-auto'
                >
                  View Issue
                </Link>
              </FlexContainer>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout (>= md) */}
      <div className='hidden md:block overflow-x-auto'>
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
                    <Link
                      href={issue.user.html_url}
                      target='_blank'
                      className='text-gray-900 hover:text-primary transition-colors'
                    >
                      <Image
                        alt={`${issue.user.login} avatar`}
                        className='w-6 h-6 rounded-full'
                        src={issue.user.avatar_url}
                        loading='lazy'
                        fullWidth={false}
                        fullHeight={false}
                      />
                    </Link>
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
                  <Link
                    href={issue.html_url}
                    target='_blank'
                    className='bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors'
                  >
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className='bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4'>
        <FlexContainer justifyCenter className='gap-2'>
          <Text
            className='text-gray-600 text-xs md:text-sm text-center'
            level='p'
          >
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
