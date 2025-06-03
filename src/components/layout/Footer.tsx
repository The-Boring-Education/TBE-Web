import { FlexContainer, Link, Text } from '@/components';
import { LINKS, routes } from '@/constant';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='bg-dark w-full'>
      <FlexContainer
        className='mx-4 justify-between py-1'
        justifyCenter={false}
      >
        <Text level='p' className='pre-title text-contentDark'>
          Built with ❤️ in 🇮🇳
        </Text>
        <FlexContainer className='gap-2'>
          <Link href={routes.refund} target='_blank'>
            <Text level='span' className='pre-title text-white'>
             Refund Policy
            </Text>
          </Link>
        </FlexContainer>
        <FlexContainer className='gap-1'>
          <Link href={LINKS.instagram} target='_blank'>
            <FaInstagram color='white' size='2em' />
          </Link>
          <Link href={LINKS.youtube} target='_blank'>
            <FaYoutube color='white' size='2em' />
          </Link>
          <Link href={LINKS.officialLinkedIn} target='_blank'>
            <FaLinkedin color='white' size='2em' />
          </Link>
        </FlexContainer>
      </FlexContainer>
    </footer>
  );
};

export default Footer;
