import { FlexContainer, Link, Logo, Text } from "@tbe/components";
import type { FooterVariantConfig } from "@tbe/constants";
import {
  getFooterVariantConfig,
  LINKS,
  products,
  routes,
  toPlatformUrl,
} from "@tbe/constants";
import type { FooterProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

type FooterLinkItem = {
  name: string;
  href?: string;
  description: string;
  external?: boolean;
};

const Footer = ({ variant = "default", isMini = false }: FooterProps = {}) => {
  const currentYear = new Date().getFullYear();
  const [shellIsDark, setShellIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setShellIsDark(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const VARIANT_CONFIG = useMemo(() => getFooterVariantConfig(Logo), []);
  const variantConfig = useMemo(() => {
    return VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  }, [variant, VARIANT_CONFIG]) as FooterVariantConfig;

  const branding = isValidElement(variantConfig.branding)
    ? cloneElement(
        variantConfig.branding as ReactElement<{ isDark?: boolean }>,
        { isDark: shellIsDark },
      )
    : variantConfig.branding;

  const footerSections: {
    products: FooterLinkItem[];
    tools: FooterLinkItem[];
    company: FooterLinkItem[];
  } = {
    products: [
      {
        name: "Shiksha",
        href: products.shiksha?.slug,
        description: "Free Courses",
      },
      {
        name: "Interview Prep",
        href: products.interviewPrep?.slug,
        description: "Tech Interviews",
      },
      {
        name: "YouFocus",
        href: products.youfocus?.slug,
        description: "YouTube Learning",
      },
      {
        name: "Projects",
        href: products.projects?.slug,
        description: "Real Projects",
      },
      {
        name: "Webinars",
        href: products.webinar?.slug,
        description: "Free Webinars",
      },
    ],
    tools: [
      {
        name: "Prep Yatra",
        href: products.prepYatra?.slug,
        description: "Interview Prep",
        external: true,
      },
      {
        name: "Tech Yatra",
        href: products.techYatra?.slug,
        description: "Tech Roadmaps",
        external: true,
      },
      {
        name: "DSA Yatra",
        href: products.dsaYatra?.slug,
        description: "DSA Practice",
        external: true,
      },
      {
        name: "Resume Yatra",
        href: products.resumeYatra?.slug,
        description: "Resume Builder",
        external: true,
      },
      {
        name: "Resources",
        href: "https://resources.theboringeducation.com",
        description: "Guides & Roadmaps",
        external: true,
      },
    ],
    company: [
      {
        name: "Contact",
        href: toPlatformUrl(routes.contactUs),
        description: "Get in Touch",
      },
      {
        name: "Terms & Conditions",
        href: toPlatformUrl(routes.termsAndConditions),
        description: "Legal Terms",
      },
      {
        name: "Refund Policy",
        href: toPlatformUrl(routes.refund),
        description: "Refund Info",
      },
      {
        name: "Contribute to TBE",
        href: toPlatformUrl(routes.contribute),
        description: "Learn and Contribute",
      },
    ],
  };

  const socialLinks = [
    { icon: FaYoutube, href: LINKS.youtube, label: "YouTube" },
    { icon: FaInstagram, href: LINKS.instagram, label: "Instagram" },
    { icon: FaLinkedin, href: LINKS.officialLinkedIn, label: "LinkedIn" },
    {
      icon: FaGithub,
      href: "https://github.com/The-Boring-Education",
      label: "GitHub",
    },
  ];

  const renderLinkList = (items: FooterLinkItem[]) => (
    <ul className="space-y-2 sm:space-y-2.5">
      {items.map(({ name, href, description, external }) => (
        <li key={name}>
          {href ? (
            <Link
              href={href}
              target={external ? "_blank" : undefined}
              className="inline-block text-slate-600 transition-colors hover:text-slate-900 group dark:text-gray-300 dark:hover:text-white"
            >
              <Text
                className="text-sm font-medium group-hover:text-primary"
                level="span"
              >
                {name}
                {external ? " ↗" : ""}
              </Text>
              <Text
                className="mt-0.5 hidden text-xs text-slate-500 dark:text-gray-400 sm:block"
                level="span"
              >
                {description}
              </Text>
            </Link>
          ) : (
            <div className="text-slate-600 dark:text-gray-300">
              <Text className="text-sm font-medium" level="span">
                {name}
              </Text>
              <Text
                className="mt-0.5 hidden text-xs text-slate-500 dark:text-gray-400 sm:block"
                level="span"
              >
                {description}
              </Text>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-900 dark:border-gray-800 dark:bg-[#0A0A0A] dark:text-white">
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6",
          isMini ? "py-5 sm:py-6" : "py-8 sm:py-10 lg:py-12",
        )}
      >
        {!isMini && (
          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:mb-8 sm:gap-8 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="mb-3 flex items-center sm:mb-4">{branding}</div>
              <Text
                className="mb-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-gray-300"
                level="p"
              >
                {variantConfig.subtitle}
              </Text>
              <FlexContainer className="gap-2.5 sm:gap-3" justifyCenter={false}>
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:hover:border-primary dark:hover:bg-primary"
                    aria-label={label}
                  >
                    <Icon size="1.05em" />
                  </Link>
                ))}
              </FlexContainer>
            </div>

            <div>
              <Text
                className="mb-3 text-sm font-semibold text-slate-900 dark:text-white sm:mb-4 sm:text-base"
                level="h4"
              >
                Products
              </Text>
              {renderLinkList(footerSections.products)}
            </div>

            <div>
              <Text
                className="mb-3 text-sm font-semibold text-slate-900 dark:text-white sm:mb-4 sm:text-base"
                level="h4"
              >
                Tools
              </Text>
              {renderLinkList(footerSections.tools)}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Text
                className="mb-3 text-sm font-semibold text-slate-900 dark:text-white sm:mb-4 sm:text-base"
                level="h4"
              >
                Company
              </Text>
              {renderLinkList(footerSections.company)}
            </div>
          </div>
        )}

        <div
          className={cn(
            isMini
              ? ""
              : "border-t border-slate-200 pt-5 dark:border-gray-800 sm:pt-6",
          )}
        >
          <FlexContainer
            className="flex-col items-center justify-between gap-2 text-center sm:flex-row sm:gap-4 sm:text-left"
            justifyCenter={false}
          >
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
              <Text
                className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm"
                level="p"
              >
                © {currentYear} The Boring Education. All rights reserved.
              </Text>
              <Text
                className="hidden text-slate-500 dark:text-gray-400 sm:inline"
                level="span"
              >
                ·
              </Text>
              <Text
                className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm"
                level="p"
              >
                Built with ❤️ in 🇮🇳
              </Text>
            </div>

            <Text
              className="text-xs text-slate-500 dark:text-gray-400"
              level="span"
            >
              Made for developers, by developers
            </Text>
          </FlexContainer>
        </div>

        <div className="sr-only">
          <Text level="span">
            The Boring Education - Tech education platform offering free
            programming courses, interview preparation, project-based learning,
            portfolio development, and comprehensive tools for software
            engineers. Learn JavaScript, React, Node.js, Python, DSA, System
            Design, and more with our interactive platform.
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
