import { FlexContainer, Text } from '@/components';
import type { ProjectHeroMetaContainerProps } from '@/interfaces';

const PageHeroMetaContainer = ({
  subtitle,
  title,
  titleClassName = 'gradient-3',
}: ProjectHeroMetaContainerProps) => (
    <FlexContainer className='gap-1' direction='col' itemCenter={false}>
      <Text className='pre-title text-greyDark' level='span'>
        {subtitle}
      </Text>
      <FlexContainer className={`${titleClassName} px-2 py-1 rounded`}>
        <Text className='strong-text' level='p'>
          {title}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );

export default PageHeroMetaContainer;
