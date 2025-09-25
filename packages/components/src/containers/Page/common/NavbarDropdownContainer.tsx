import { FlexContainer, Link } from '@tbe/components';
import type { NavbarDropdownContainerProps } from '@tbe/interface';

const NavbarDropdownContainer = ({ links }: NavbarDropdownContainerProps) => (
  <div className='p-2'>
    {links.map(({ name, href, description, target, isDevelopment }) => (
      <FlexContainer
        key={name}
        className='relative rounded-lg p-2 hover:bg-gray-100 max-w-sm'
        direction='col'
        itemCenter={false}
      >
        <FlexContainer direction='col' itemCenter={false}>
          <Link
            className='text-base font-semibold text-black hover:text-primary'
            href={href}
            target={target}
          >
            {name}{' '}
            {isDevelopment && <span className='text-secondary'>(In Dev)</span>}
            <span className='absolute inset-0' />
          </Link>
          <p className='text-gray-600 break-words'>{description}</p>
        </FlexContainer>
      </FlexContainer>
    ))}
  </div>
);

export default NavbarDropdownContainer;
