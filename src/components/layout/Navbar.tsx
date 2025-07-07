import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

import { LINKS, TOP_NAVIGATION } from '@/constant';
import { useScrollDirection } from '@/hooks';

import {
  FlexContainer,
  Link,
  LoginRedirectButton,
  Logo,
  MobileNavbarLinksContainer,
  NavbarDropdownContainer,
  NotificationPopover,
  PopoverContainer,
  Text,
  UserAvatar,
  UserPointButton,
} from '..';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const { isVisible } = useScrollDirection(100);

  const handleSetOpen = (popoverName: string) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      animate={{ y: isVisible ? 0 : -100 }}
      className='fixed top-0 left-0 right-0 z-40 bg-white shadow-sm'
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <nav className='flex items-center justify-between p-2 lg:px-8 border'>
        <div className='w-100 flex'>
          <Logo />
        </div>
        <div className='flex lg:hidden'>
          <button
            className='-m-2.5 flex gap-2 items-center justify-center rounded-md p-2.5 text-black'
            type='button'
            onClick={() => setMobileMenuOpen(true)}
          >
            <NotificationPopover />
            <UserPointButton />
            <UserAvatar />
            <Bars3Icon aria-hidden='true' className='h-6 w-6' color='black' />
          </button>
        </div>
        <div className='hidden items-center lg:flex lg:gap-x-4'>
          <PopoverContainer
            isOpen={openPopover === 'cohorts'}
            label='Cohorts'
            onToggle={() => handleSetOpen('cohorts')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.cohorts} />
          </PopoverContainer>
          <PopoverContainer
            isOpen={openPopover === 'products'}
            label='Learn'
            onToggle={() => handleSetOpen('products')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.products} />
          </PopoverContainer>
          <PopoverContainer
            isOpen={openPopover === 'tools'}
            label='Tools'
            onToggle={() => handleSetOpen('tools')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.tools} />
          </PopoverContainer>
          <PopoverContainer
            isOpen={openPopover === 'links'}
            label='Links'
            panelClasses='-left-6'
            onToggle={() => handleSetOpen('links')}
          >
            <NavbarDropdownContainer links={TOP_NAVIGATION.links} />
          </PopoverContainer>

          <NotificationPopover />
          <UserPointButton />
          <LoginRedirectButton text='Login' />
          <UserAvatar />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <Dialog
        as='div'
        className='lg:hidden'
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-2 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <Logo />
            <button
              className='-m-2.5 rounded-md p-2.5 text-black'
              type='button'
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon aria-hidden='true' className='h-6 w-6' />
            </button>
          </div>
          <AnimatePresence>
            <motion.div
              key='cohorts-popover'
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className='mt-6 flow-root'>
                <div className='divide-white-500/10 -my-6 divide-y'>
                  <FlexContainer
                    className='gap-2 space-y-2 py-6'
                    direction='col'
                    itemCenter={false}
                  >
                    <FlexContainer
                      className='gap-1'
                      direction='col'
                      itemCenter={false}
                      justifyCenter={false}
                    >
                      <LoginRedirectButton text='Login' />
                    </FlexContainer>

                    <MobileNavbarLinksContainer
                      links={TOP_NAVIGATION.cohorts}
                      title='Cohorts'
                      onLinkClick={handleCloseMobileMenu}
                    />
                    <MobileNavbarLinksContainer
                      links={TOP_NAVIGATION.products}
                      title='Learn'
                      onLinkClick={handleCloseMobileMenu}
                    />
                    <MobileNavbarLinksContainer
                      links={TOP_NAVIGATION.tools}
                      title='Tools'
                      onLinkClick={handleCloseMobileMenu}
                    />
                    <MobileNavbarLinksContainer
                      links={TOP_NAVIGATION.links}
                      title='Links'
                      onLinkClick={handleCloseMobileMenu}
                    />
                    <FlexContainer
                      className='gap-1'
                      direction='col'
                      itemCenter={false}
                      justifyCenter={false}
                    >
                      <Text className='pre-title text-greyDark' level='span'>
                        Connect with us
                      </Text>
                      <FlexContainer
                        className='gap-1'
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        <Link href={LINKS.instagram} target='_blank'>
                          <FaInstagram color='black' size='2em' />
                        </Link>
                        <Link href={LINKS.youtube} target='_blank'>
                          <FaYoutube color='black' size='2em' />
                        </Link>
                        <Link href={LINKS.officialLinkedIn} target='_blank'>
                          <FaLinkedin color='black' size='2em' />
                        </Link>
                      </FlexContainer>
                    </FlexContainer>
                  </FlexContainer>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Dialog.Panel>
      </Dialog>
    </motion.header>
  );
};

export default Navbar;
