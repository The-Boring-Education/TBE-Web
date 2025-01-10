import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
  FlexContainer,
  Link,
  LoginWithGoogleButton,
  Logo,
  MobileNavbarLinksContainer,
  NavbarDropdownContainer,
  PopoverContainer,
  Text,
  UserAvatar,
} from '..';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LINKS, routes, TOP_NAVIGATION } from '@/constant';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = usePathname();
  const session = useSession();

  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleSetOpen = (popoverName: string) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header>
      <nav className='flex items-center justify-between p-4 lg:px-8'>
        <div className='w-100 flex'>
          <Logo />
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 flex gap-2 items-center justify-center rounded-md p-2.5 text-black'
            onClick={() => setMobileMenuOpen(true)}
          >
            <UserAvatar />
            <Bars3Icon className='h-6 w-6' aria-hidden='true' color='black' />
          </button>
        </div>
        <div className='hidden items-center lg:flex lg:gap-x-4'>
          <PopoverContainer
            label='Products'
            isOpen={openPopover === 'products'}
            onToggle={() => handleSetOpen('products')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.products} />
          </PopoverContainer>

          <PopoverContainer
            label='Links'
            panelClasses='-left-6'
            isOpen={openPopover === 'links'}
            onToggle={() => handleSetOpen('links')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.links} />
          </PopoverContainer>
          {!path?.startsWith(routes.register) && (
            <LoginWithGoogleButton text='Login' />
          )}
          <UserAvatar />
        </div>
      </nav>
      <Dialog
        as='div'
        className='lg:hidden'
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <Logo />
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-black'
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='divide-white-500/10 -my-6 divide-y'>
              <FlexContainer
                className='gap-2 space-y-2 py-6'
                direction='col'
                itemCenter={false}
              >
                {session.status === 'unauthenticated' && (
                  <FlexContainer
                    itemCenter={false}
                    justifyCenter={false}
                    direction='col'
                    className='gap-1'
                  >
                    <Text level='span' className='pre-title text-greyDark'>
                      Get Started
                    </Text>
                    <FlexContainer
                      itemCenter={false}
                      justifyCenter={false}
                      direction='col'
                      className='gap-1'
                    >
                      <LoginWithGoogleButton text='Login' />
                    </FlexContainer>
                  </FlexContainer>
                )}
                <MobileNavbarLinksContainer
                  title='Our Products'
                  links={TOP_NAVIGATION.products}
                  onLinkClick={handleCloseMobileMenu}
                />
                <MobileNavbarLinksContainer
                  title='Links'
                  links={TOP_NAVIGATION.links}
                  onLinkClick={handleCloseMobileMenu}
                />

                <FlexContainer
                  itemCenter={false}
                  justifyCenter={false}
                  direction='col'
                  className='gap-1'
                >
                  <Text level='span' className='pre-title text-greyDark'>
                    Connect with us
                  </Text>
                  <FlexContainer
                    itemCenter={false}
                    justifyCenter={false}
                    className='gap-1'
                  >
                    <Link href={LINKS.instagram} target='_blank'>
                      <FaInstagram color='black' size='2em' />
                    </Link>
                    <Link href={LINKS.youtube} target='_blank'>
                      <FaYoutube color='black' size='2em' />
                    </Link>
                  </FlexContainer>
                </FlexContainer>
              </FlexContainer>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Navbar;
