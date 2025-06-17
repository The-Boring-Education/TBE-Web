import { CircularProgressBar, FlexContainer, Text } from '@/components';
import type { ResumeEvaluationSectionProps } from '@/interfaces';

const ResumeEvaluationSection = ({
  title,
  subtitle,
  items,
  colorScheme,
}: ResumeEvaluationSectionProps) => (
  <FlexContainer className='gap-4' direction='col'>
    <FlexContainer className='gap-1' direction='col'>
      <Text className='heading-5' level='h5'>
        {title}
      </Text>
      <Text className='pre-title' level='p'>
        {subtitle}
      </Text>
    </FlexContainer>
    <FlexContainer wrap className='gap-4'>
      {items.map((item: any) => (
        <FlexContainer
          key={item.skill || item.name}
          itemCenter
          className='gap-3'
        >
          <CircularProgressBar
            bg={colorScheme.bg}
            color={colorScheme.ring}
            percentage={item.percentage}
            size={50}
            strokeWidth={5}
          >
            <Text
              className={`text-xs font-bold ${colorScheme.text}`}
              level='span'
            >
              {item.percentage}%
            </Text>
          </CircularProgressBar>
          <FlexContainer
            className='gap-0.5 justify-start'
            direction='col'
            itemCenter={false}
          >
            <Text
              className={`strong-text capitalize ${colorScheme.text}`}
              level='span'
            >
              {item.skill || item.name}
            </Text>
            <Text className='pre-title text-gray-500' level='span'>
              Seen in {item.frequency || item.count} jobs
            </Text>
          </FlexContainer>
        </FlexContainer>
      ))}
    </FlexContainer>
  </FlexContainer>
);

export default ResumeEvaluationSection;
