import { CircularProgressBar, FlexContainer, Text } from '@/components';
import { ResumeEvaluationSectionProps } from '@/interfaces';

const ResumeEvaluationSection = ({
  title,
  items,
  colorScheme,
}: ResumeEvaluationSectionProps) => {
  return (
    <FlexContainer direction='col' className='gap-4'>
      <Text level='h5' className='heading-5'>
        {title}
      </Text>
      <FlexContainer className='gap-4' wrap>
        {items.map((item: any) => (
          <FlexContainer
            key={item.skill || item.name}
            className='gap-3'
            itemCenter
          >
            <CircularProgressBar
              percentage={item.percentage}
              color={colorScheme.ring}
              bg={colorScheme.bg}
              size={50}
              strokeWidth={5}
            >
              <Text
                level='span'
                className={`text-xs font-bold ${colorScheme.text}`}
              >
                {item.percentage}%
              </Text>
            </CircularProgressBar>
            <FlexContainer
              direction='col'
              className='gap-0.5 justify-start'
              itemCenter={false}
            >
              <Text
                level='span'
                className={`strong-text capitalize ${colorScheme.text}`}
              >
                {item.skill || item.name}
              </Text>
              <Text level='span' className='pre-title text-gray-500'>
                Seen in {item.frequency || item.count} jobs
              </Text>
            </FlexContainer>
          </FlexContainer>
        ))}
      </FlexContainer>
    </FlexContainer>
  );
};

export default ResumeEvaluationSection;
