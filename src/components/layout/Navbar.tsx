import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { TOP_NAVIGATION } from '@/constant';
import {
  Link,
  Logo,
  NavbarDropdownContainer,
  PopoverContainer,
  ScreenReader,
} from '..';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      <nav className='flex items-center justify-between p-4 lg:px-8'>
        <div className='w-100 flex'>
          <Logo />
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-black'
            onClick={() => setMobileMenuOpen(true)}
          >
            <ScreenReader text='Open main menu' />
            <Bars3Icon className='h-6 w-6' aria-hidden='true' color='black' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          <PopoverContainer label='Our Cohorts'>
            <NavbarDropdownContainer />
          </PopoverContainer>
          {TOP_NAVIGATION.links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className='paragraph text-base font-normal hover:text-primary'
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      <Dialog
        as='div'
        className='lg:hidden'
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-accent px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <Logo />
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-black'
              onClick={() => setMobileMenuOpen(false)}
            >
              <ScreenReader text='Close menu' />
              <XMarkIcon className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='divide-white-500/10 -my-6 divide-y'>
              <div className='space-y-2 py-6'>
                <PopoverContainer label='Our Cohorts'>
                  <NavbarDropdownContainer />
                </PopoverContainer>
                {TOP_NAVIGATION.links.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='paragraph -mx-3 block rounded-lg px-3 text-base hover:text-primary'
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Navbar;
