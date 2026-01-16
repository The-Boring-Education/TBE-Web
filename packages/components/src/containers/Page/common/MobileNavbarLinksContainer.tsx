import { FlexContainer, Link, Text } from '@tbe/components';
import type { MobileNavbarLinksContainerProps } from '@tbe/interface';

const MobileNavbarLinksContainer = ({
  title,
  links,
  onLinkClick,
}: MobileNavbarLinksContainerProps) => (
  <FlexContainer
    className='gap-2'
    direction='col'
    itemCenter={false}
    justifyCenter={false}
  >
    <Text className='pre-title text-primary' level='span'>
      {title.toLocaleUpperCase()}
    </Text>
    <FlexContainer
      className='gap-2'
      direction='col'
      itemCenter={false}
      justifyCenter={false}
    >
      {links.map(({ name, href, target, description }, index) => {
        // Skip rendering Link if href is empty or undefined
        if (!href || (typeof href === 'string' && href.trim() === '')) {
          return (
            <div key={index} className='text-base font-semibold text-black'>
              <Text className='strong-text' level='span'>
                {name}
              </Text>
              <br />
              <Text className='pre-title text-greyDark' level='span'>
                {description}
              </Text>
            </div>
          );
        }

        return (
          <Link
            key={index}
            className='text-base font-semibold text-black'
            href={href}
            target={target}
            onClick={onLinkClick}
          >
            <Text className='strong-text' level='span'>
              {name}
            </Text>
            <br />
            <Text className='pre-title text-greyDark' level='span'>
              {description}
            </Text>
          </Link>
        );
      })}
    </FlexContainer>
  </FlexContainer>
);

export default MobileNavbarLinksContainer;
