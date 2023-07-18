import { TOP_NAVIGATION } from '@/constant';

const NavbarDropdownContainer = () => {
  return (
    <div className='p-2'>
      {TOP_NAVIGATION.cohorts.map(({ name, href, description }) => {
        return (
          <div
            key={name}
            className='group relative flex gap-x-6 rounded-lg p-2 hover:bg-gray-100'
          >
            <div>
              <a href={href} className='text-base font-semibold text-black'>
                {name}
                <span className='absolute inset-0' />
              </a>
              <p className='text-gray-600'>{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NavbarDropdownContainer;
