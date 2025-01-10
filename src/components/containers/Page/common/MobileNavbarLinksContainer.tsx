import { FlexContainer, Link, Text } from '@/components';
import { MobileNavbarLinksContainerProps } from '@/interfaces';

const MobileNavbarLinksContainer = ({
  title,
  links,
  onLinkClick,
}: MobileNavbarLinksContainerProps) => {
  return (
    <FlexContainer
      itemCenter={false}
      justifyCenter={false}
      direction='col'
      className='gap-1'
    >
      <Text level='span' className='pre-title text-greyDark'>
        {title}
      </Text>
      <FlexContainer
        itemCenter={false}
        justifyCenter={false}
        direction='col'
        className='gap-2'
      >
        {links.map(({ name, href, target, description }, index) => {
          return (
            <Link
              key={index}
              href={href}
              className='text-base font-semibold text-black'
              target={target}
              onClick={onLinkClick}
            >
              <Text level='span' className='strong-text'>
                {name}
              </Text>
              <br />
              <Text level='span' className='pre-title text-greyDark'>
                {description}
              </Text>
            </Link>
          );
        })}
      </FlexContainer>
    </FlexContainer>
  );
};

export default MobileNavbarLinksContainer;
