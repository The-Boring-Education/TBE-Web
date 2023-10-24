import {
  FlexContainer,
  GradientContainer,
  Image,
  LinkButton,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { ChooseTechCohortCardProps } from '@/interfaces';

const ChooseTechCohortCard = ({
  id,
  title,
  content,
  href,
  image,
  imageAltText,
  onSelected,
}: ChooseTechCohortCardProps) => {
  return (
    <GradientContainer
      className='max-w-sm rounded bg-white'
      childrenClassName='p-2'
    >
      <FlexContainer
        direction='col'
        itemCenter={true}
        justifyCenter={true}
        className='gap-2'
      >
        <FlexContainer
          direction='col'
          itemCenter={false}
          justifyCenter={false}
          className='w-full'
        >
          <Image
            className='m-auto w-3/5 rounded-t-lg'
            src={`${image}`}
            alt={imageAltText}
          />
        </FlexContainer>
        <FlexContainer
          direction='col'
          itemCenter={false}
          justifyCenter={false}
          className='items-start justify-start gap-0.5'
        >
          <Text level='span' className='heading-5 text-primary'>
            {title}
          </Text>
          <Text level='span' className='pre-title text-grey'>
            {content}
          </Text>
        </FlexContainer>
        <FlexContainer
          direction='col'
          itemCenter={false}
          justifyCenter={false}
          className='gap-1'
          fullWidth={true}
        >
          <LinkButton
            href={`#${routes.internals.landing.talkToCounsellors}`}
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Talk to Counsellor',
              onClick: () => onSelected(id),
            }}
          />
          <LinkButton
            href={href}
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Know More',
              className: '',
            }}
          />
        </FlexContainer>
      </FlexContainer>
    </GradientContainer>
  );
};

export default ChooseTechCohortCard;
