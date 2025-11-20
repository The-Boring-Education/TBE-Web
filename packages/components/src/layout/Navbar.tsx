import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

import { LINKS, TOP_NAVIGATION } from '@tbe/constants';
import { useScrollDirection } from '@tbe/hooks';
import type { MainNavbarProps } from '@tbe/interface';

import {
  Button,
  FlexContainer,
  Link,
  LoginRedirectButton,
  Logo,
  MobileNavbarLinksContainer,
  NavbarDropdownContainer,
  PopoverContainer,
  Text,
  UserAvatar,
  UserPointButton,
} from '..';

import NotificationPopover from '../common/Notification/index';

const Navbar = ({ 
  onSignOut, 
  userId, 
  variant = 'default',
  showFullNavigation = true,
  customBranding,
  customActions = [],
  dashboardRoute
}: MainNavbarProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const { isVisible } = useScrollDirection(100);

  const handleSetOpen = (popoverName: string) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Variant-based configuration
  const isPrepYatraVariant = variant === 'prepyatra';

  // Determine background class based on variant
  const getBackgroundClass = () => {
    if (variant === 'transparent') {
      return 'glass-dark backdrop-blur-md';
    }
    return 'bg-white';
  };

  // Determine dashboard route based on variant or provided prop
  const getDashboardRoute = () => {
    if (isPrepYatraVariant) {
      return '/dashboard';
    }
    return dashboardRoute || '/user/dashboard';
  };

  const finalDashboardRoute = getDashboardRoute();

  // Prep-yatra branding component
  const getPrepYatraBranding = () => (
    <div className='flex flex-col gap-0'>
      <span className='text-2xl font-bold text-primary leading-tight'>
        PrepYatra
      </span>
      <span className='text-[10px] text-greyDark -mt-0.5'>
        By The Boring Education
      </span>
    </div>
  );

  // Determine branding - variant takes precedence over customBranding
  const finalBranding = isPrepYatraVariant ? getPrepYatraBranding() : (customBranding || <Logo />);

  // Check if we should use custom actions or default navigation
  const shouldUseCustomActions = customActions && customActions.length > 0 && !isPrepYatraVariant;

  return (
    <motion.header
      animate={{ y: isVisible ? 0 : -100 }}
      className={`fixed top-0 left-0 right-0 z-40 ${getBackgroundClass()} shadow-sm`}
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <nav className={`flex items-center justify-between p-2 lg:px-8 ${isPrepYatraVariant ? 'border-b border-greyLight' : 'border'}`}>
        <div className='w-100 flex'>
          {finalBranding}
        </div>
        {shouldUseCustomActions ? (
          <>
            <div className='flex lg:hidden gap-2 items-center'>
              {customActions.map((action: React.ReactNode, index: number) => (
                <div key={index}>{action}</div>
              ))}
              <button
                className='-m-2.5 flex items-center justify-center rounded-md p-2.5 text-black'
                type='button'
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon aria-hidden='true' className='h-6 w-6' color='black' />
              </button>
            </div>
            <div className='hidden items-center lg:flex lg:gap-3'>
              {customActions.map((action: React.ReactNode, index: number) => (
                <div key={index}>{action}</div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className='flex lg:hidden gap-2 items-center'>
              <NotificationPopover />
              <UserPointButton />
              <UserAvatar dashboardRoute={finalDashboardRoute} />
              <button
                className='-m-2.5 flex items-center justify-center rounded-md p-2.5 text-black'
                type='button'
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon aria-hidden='true' className='h-6 w-6' color='black' />
              </button>
            </div>
            {showFullNavigation && (
              <div className='hidden items-center lg:flex lg:gap-x-4'>
                <FlexContainer direction='col' itemCenter={false}>
                  <Link
                    className='text-base text-black hover:text-primary'
                    href={TOP_NAVIGATION.issues[0]?.href || ''}
                    target={TOP_NAVIGATION.issues[0]?.target}
                  >
                    {TOP_NAVIGATION.issues[0]?.name}
                  </Link>
                </FlexContainer>
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
                <UserAvatar dashboardRoute={finalDashboardRoute} />
              </div>
            )}
          </>
        )}
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
            {finalBranding}
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
