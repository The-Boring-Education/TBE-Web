import {
  FlexContainer,
  Image,
  LinkButton,
  LoginRedirectButton,
  Text,
} from '@tbe/components';
import { useUser } from '@tbe/hooks';
import type { PortfolioTemplateProps } from '@tbe/interface';

import LinkText from '../../../common/Typography/Link';

const PortfolioTemplate = ({
  repo,
  imageUrl,
  title,
  description,
  developer: { name: developerName, link: developerProfileLink },
  previewLink,
}: PortfolioTemplateProps) => {
  const { isAuth } = useUser();

  const codeButtonContainer = isAuth && (
    <LinkButton
      buttonProps={{
        variant: 'OUTLINE',
        text: 'Code',
        active: isAuth,
        className: 'border-white text-white',
      }}
      className=''
      href={repo}
      target='_blank'
    />
  );

  const loginButton = !isAuth && <LoginRedirectButton />;

  return (
    <FlexContainer className='w-full md:w-[48%] lg:w-[31%] border-2 border-gray-300 rounded-xl gap-2'>
      <Image alt={title} className='w-full rounded' src={imageUrl} />
      <FlexContainer
        className='px-3 pb-3 gap-1'
        direction='col'
        fullWidth
        itemCenter={false}
      >
        <Text className='heading-4 text-white' level='h2'>
          {title}
        </Text>
        <Text className='paragraph text-white' level='p'>
          {description}
        </Text>
        <FlexContainer className='gap-1 my-2' justifyCenter={false}>
          {codeButtonContainer}
          {loginButton}
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Preview',
              className: 'border-white text-white',
            }}
            className=''
            href={previewLink}
            target='_blank'
          />
        </FlexContainer>
        <Text className='pre-text text-white' level='p'>
          Template by{' '}
          <LinkText
            className='text-white underline'
            href={developerProfileLink}
            target='_blank'
          >
            {developerName}
          </LinkText>
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default PortfolioTemplate;
