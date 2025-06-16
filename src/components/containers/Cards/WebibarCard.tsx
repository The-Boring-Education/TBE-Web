import { FlexContainer, Image, LinkButton, Text } from '@/components';
import type { WebinarCardProps } from '@/interfaces';
import { formatDate } from '@/utils';

const WebibarCard = ({
  name,
  description,
  coverImageURL,
  dateAndTime,
  slug,
}: WebinarCardProps) => {
  return (
    <FlexContainer
      className='p-3 max-w-md bg-dark rounded-lg shadow-lg gap-2'
      direction='col'
    >
      <Image alt={`${name} | The Boring Workshops`} src={coverImageURL} />
      <FlexContainer className='gap-2' direction='col' itemCenter={false}>
        <FlexContainer className='gap-3' direction='col' itemCenter={false}>
          <FlexContainer className='gap-1' direction='col' itemCenter={false}>
            <Text className='heading-5 text-contentDark' level='h5'>
              {name}
            </Text>
            <Text className='pre-title text-grey' level='p'>
              {description}
            </Text>
          </FlexContainer>
          <Text className='strong-text text-secondary' level='span'>
            {formatDate({ dateAndTime }).date +
              ', ' +
              formatDate({ dateAndTime }).time}
          </Text>
        </FlexContainer>
        <LinkButton
          buttonProps={{
            variant: 'PRIMARY',
            text: 'View Webinar',
            className: 'w-full',
          }}
          className='w-full'
          href={`/webinar/${slug}`}
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default WebibarCard;
