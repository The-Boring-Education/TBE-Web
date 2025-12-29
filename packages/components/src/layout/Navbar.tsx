import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { getNavbarVariantConfig, LINKS, TOP_NAVIGATION } from '@tbe/constants';
import { useScrollDirection } from '@tbe/hooks';
import type { MainNavbarProps, NavbarVariantConfig } from '@tbe/interface';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

import {
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
  dashboardRoute,
  theme
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

  // Get variant configuration - memoized for performance
  const VARIANT_CONFIG = useMemo(() => getNavbarVariantConfig(Logo), []);
  const variantConfig = useMemo(() => {
    return VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  }, [variant, VARIANT_CONFIG]) as NavbarVariantConfig;

  // Determine background class based on variant and theme
  const getBackgroundClass = () => {
    if (variant === 'transparent') {
      return 'glass-dark backdrop-blur-md';
    }
    if (theme === 'dark') {
      return 'bg-[#0A0A0A]';
    }
    return 'bg-white';
  };

  const finalDashboardRoute = dashboardRoute || variantConfig.dashboardRoute;

  const finalBranding = customBranding || variantConfig.branding;

  // Determine border class based on theme
  const borderClass = theme === 'dark'
    ? 'border-0'
    : (variantConfig.borderClass || 'border');
  const shouldUseCustomActions = customActions && customActions.length > 0;

  // Check if variant requires authentication (defaults to true)
  const requiresAuth = variantConfig.requiresAuth !== false;

  // Check if variant should show gamification (defaults to true if requiresAuth is true)
  const showGamification = requiresAuth && variantConfig.showGamification !== false;

  // Check if variant should show Cohorts section (defaults to true)
  const showCohorts = variantConfig.showCohorts !== false;

  // Check if variant should show Learn section (defaults to true)
  const showLearn = variantConfig.showLearn !== false;

  return (
    <motion.header
      animate={{ y: isVisible ? 0 : -100 }}
      className={`fixed top-0 left-0 right-0 z-40 ${getBackgroundClass()} shadow-sm`}
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <nav className={`flex items-center justify-between p-2 lg:px-8 ${borderClass}`}>
        <div className='flex items-center'>
          {finalBranding}
        </div>
        {shouldUseCustomActions ? (
          <>
            <div className='flex lg:hidden gap-2 items-center'>
              {customActions.map((action: React.ReactNode, index: number) => (
                <div key={index}>{action}</div>
              ))}
              <button
                className={`-m-2.5 flex items-center justify-center rounded-md p-2.5 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                type='button'
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon aria-hidden='true' className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
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
              {requiresAuth && <NotificationPopover />}
              {showGamification && <UserPointButton />}
              {requiresAuth && <UserAvatar dashboardRoute={finalDashboardRoute} />}
              <button
                className={`-m-2.5 flex items-center justify-center rounded-md p-2.5 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                type='button'
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon aria-hidden='true' className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
              </button>
            </div>
            {showFullNavigation && (
              <div className='hidden items-center lg:flex lg:gap-x-4'>
                {TOP_NAVIGATION.issues[0]?.href && (
                  <FlexContainer direction='col' itemCenter={false}>
                    <Link
                      className={`text-base ${theme === 'dark' ? 'text-white' : 'text-black'} hover:text-primary`}
                      href={TOP_NAVIGATION.issues[0].href}
                      target={TOP_NAVIGATION.issues[0]?.target}
                    >
                      {TOP_NAVIGATION.issues[0]?.name}
                    </Link>
                  </FlexContainer>
                )}
                {showCohorts && (
                  <PopoverContainer
                    isOpen={openPopover === 'cohorts'}
                    label='Cohorts'
                    onToggle={() => handleSetOpen('cohorts')}
                    theme={theme}
                  >
                    <NavbarDropdownContainer links={TOP_NAVIGATION.cohorts} />
                  </PopoverContainer>
                )}
                {showLearn && (
                  <PopoverContainer
                    isOpen={openPopover === 'products'}
                    label='Learn'
                    onToggle={() => handleSetOpen('products')}
                    theme={theme}
                  >
                    <NavbarDropdownContainer links={TOP_NAVIGATION.products} />
                  </PopoverContainer>
                )}
                <PopoverContainer
                  isOpen={openPopover === 'tools'}
                  label='Tools'
                  onToggle={() => handleSetOpen('tools')}
                  theme={theme}
                >
                  <NavbarDropdownContainer links={TOP_NAVIGATION.tools} />
                </PopoverContainer>
                <PopoverContainer
                  isOpen={openPopover === 'links'}
                  label='Links'
                  panelClasses='-left-6'
                  onToggle={() => handleSetOpen('links')}
                  theme={theme}
                >
                  <NavbarDropdownContainer links={TOP_NAVIGATION.links} />
                </PopoverContainer>

                {requiresAuth && <NotificationPopover />}
                {showGamification && <UserPointButton />}
                {requiresAuth && <LoginRedirectButton text='Login' />}
                {requiresAuth && <UserAvatar dashboardRoute={finalDashboardRoute} />}
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
        <Dialog.Panel className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} p-2 sm:max-w-sm sm:ring-1 ${theme === 'dark' ? 'sm:ring-gray-100/10' : 'sm:ring-gray-900/10'}`}>
          <div className='flex items-center justify-between'>
            {finalBranding}
            <button
              className={`-m-2.5 rounded-md p-2.5 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
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
                    {requiresAuth && (
                      <FlexContainer
                        className='gap-1'
                        direction='col'
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        <LoginRedirectButton text='Login' />
                      </FlexContainer>
                    )}

                    {showCohorts && (
                      <MobileNavbarLinksContainer
                        links={TOP_NAVIGATION.cohorts}
                        title='Cohorts'
                        onLinkClick={handleCloseMobileMenu}
                      />
                    )}
                    {showLearn && (
                      <MobileNavbarLinksContainer
                        links={TOP_NAVIGATION.products}
                        title='Learn'
                        onLinkClick={handleCloseMobileMenu}
                      />
                    )}
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
                      <Text className={`pre-title ${theme === 'dark' ? 'text-gray-400' : 'text-greyDark'}`} level='span'>
                        Connect with us
                      </Text>
                      <FlexContainer
                        className='gap-1'
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        <Link href={LINKS.instagram} target='_blank'>
                          <FaInstagram className={theme === 'dark' ? 'text-white' : 'text-black'} size='2em' />
                        </Link>
                        <Link href={LINKS.youtube} target='_blank'>
                          <FaYoutube className={theme === 'dark' ? 'text-white' : 'text-black'} size='2em' />
                        </Link>
                        <Link href={LINKS.officialLinkedIn} target='_blank'>
                          <FaLinkedin className={theme === 'dark' ? 'text-white' : 'text-black'} size='2em' />
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
