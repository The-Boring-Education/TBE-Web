import {
  Text,
  Image,
  FlexContainer,
  LinkButton,
  LoginWithGoogleButton,
} from '@/components';
import { PortfolioTemplateProps } from '@/interfaces';
import { useUser } from '@/hooks';
import LinkText from '@/components/common/Typography/Link';

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
      href={repo}
      target='_blank'
      className=''
      buttonProps={{
        variant: 'OUTLINE',
        text: 'Code',
        active: isAuth,
        className: 'border-white text-white',
      }}
    />
  );

  const loginButton = !isAuth && (
    <LoginWithGoogleButton text='Login to Start' />
  );

  return (
    <FlexContainer className='w-full md:w-[48%] lg:w-[31%] border-2 border-gray-300 rounded-xl gap-2'>
      <Image alt={title} src={imageUrl} className='w-full rounded' />
      <FlexContainer
        direction='col'
        itemCenter={false}
        fullWidth={true}
        className='px-3 pb-3 gap-1'
      >
        <Text level='h2' className='heading-4 text-white'>
          {title}
        </Text>
        <Text level='p' className='paragraph text-white'>
          {description}
        </Text>
        <FlexContainer justifyCenter={false} className='gap-1 my-2'>
          {codeButtonContainer}
          {loginButton}
          <LinkButton
            href={previewLink}
            target='_blank'
            className=''
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Preview',
              className: 'border-white text-white',
            }}
          />
        </FlexContainer>
        <Text level='p' className='pre-text text-white'>
          Template by{' '}
          <LinkText
            href={developerProfileLink}
            target='_blank'
            className='text-white underline'
          >
            {developerName}
          </LinkText>
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default PortfolioTemplate;
