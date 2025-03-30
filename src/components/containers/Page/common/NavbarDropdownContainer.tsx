import { FlexContainer, Link } from '@/components';
import { NavbarDropdownContainerProps } from '@/interfaces';

const NavbarDropdownContainer = ({ links }: NavbarDropdownContainerProps) => {
  return (
    <div className='p-2'>
      {links.map(({ name, href, description, target, isDevelopment }) => {
        return (
          <FlexContainer
            key={name}
            direction='col'
            itemCenter={false}
            className='relative rounded-lg p-2 hover:bg-gray-100 max-w-sm'
          >
            <FlexContainer direction='col' itemCenter={false}>
              <Link
                href={href}
                className='text-base font-semibold text-black hover:text-primary'
                target={target}
              >
                {name}{' '}
                {isDevelopment && (
                  <span className='text-secondary'>(In Dev)</span>
                )}
                <span className='absolute inset-0' />
              </Link>
              <p className='text-gray-600 break-words'>{description}</p>
            </FlexContainer>
          </FlexContainer>
        );
      })}
    </div>
  );
};

export default NavbarDropdownContainer;
