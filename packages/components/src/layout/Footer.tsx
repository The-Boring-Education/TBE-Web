import { FlexContainer, Link, Logo, Text } from "@tbe/components";
import type { FooterVariantConfig } from "@tbe/constants";
import {
  getFooterVariantConfig,
  LINKS,
  products,
  routes,
} from "@tbe/constants";
import type { FooterProps } from "@tbe/interface";
import { useMemo } from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

const Footer = ({ variant = "default", isMini = false }: FooterProps = {}) => {
  const currentYear = new Date().getFullYear();

  // Get variant configuration - memoized for performance
  const VARIANT_CONFIG = useMemo(() => getFooterVariantConfig(Logo), []);
  const variantConfig = useMemo(() => {
    return VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  }, [variant, VARIANT_CONFIG]) as FooterVariantConfig;

  const footerSections = {
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
        name: "UnSkilled",
        href: products.unskilled?.slug,
        description: "Job Insights",
      },
    ],
    company: [
      { name: "Contact", href: routes.contactUs, description: "Get in Touch" },
      {
        name: "Terms & Conditions",
        href: routes.termsAndConditions,
        description: "Legal Terms",
      },
      {
        name: "Refund Policy",
        href: routes.refund,
        description: "Refund Info",
      },
      {
        name: "Contribute to TBE",
        href: routes.contribute,
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

  return (
    <footer className="bg-dark w-full border-t border-gray-800">
      <div className={`max-w-7xl mx-auto px-4 ${isMini ? "py-6" : "py-12"}`}>
        {/* Main Footer Content */}
        {!isMini && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                {variantConfig.branding}
              </div>
              <Text className="text-gray-300 mb-4 max-w-md" level="p">
                {variantConfig.subtitle}
              </Text>
              <FlexContainer className="gap-4" justifyCenter={false}>
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label={label}
                  >
                    <Icon color="white" size="1.5em" />
                  </Link>
                ))}
              </FlexContainer>
            </div>

            {/* Products */}
            <div>
              <Text className="text-white font-semibold mb-4" level="h4">
                Products
              </Text>
              <ul className="space-y-2">
                {footerSections.products.map(({ name, href, description }) => (
                  <li key={name}>
                    {href ? (
                      <Link
                        href={href}
                        className="text-gray-300 hover:text-white transition-colors group"
                      >
                        <div>
                          <Text
                            className="group-hover:text-primary"
                            level="span"
                          >
                            {name}
                          </Text>
                          <br />
                          <Text className="text-xs text-gray-400" level="span">
                            {description}
                          </Text>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-gray-300">
                        <Text level="span">{name}</Text>
                        <br />
                        <Text className="text-xs text-gray-400" level="span">
                          {description}
                        </Text>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <Text className="text-white font-semibold mb-4" level="h4">
                Tools
              </Text>
              <ul className="space-y-2">
                {footerSections.tools.map((item: any) => (
                  <li key={item.name}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        className="text-gray-300 hover:text-white transition-colors group"
                      >
                        <div>
                          <Text
                            className="group-hover:text-primary"
                            level="span"
                          >
                            {item.name}
                            {item.external && " ↗"}
                          </Text>
                          <br />
                          <Text className="text-xs text-gray-400" level="span">
                            {item.description}
                          </Text>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-gray-300">
                        <Text level="span">{item.name}</Text>
                        <br />
                        <Text className="text-xs text-gray-400" level="span">
                          {item.description}
                        </Text>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <Text className="text-white font-semibold mb-4" level="h4">
                Company
              </Text>
              <ul className="space-y-2">
                {footerSections.company.map((item: any) => (
                  <li key={item.name}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        className="text-gray-300 hover:text-white transition-colors group"
                      >
                        <div>
                          <Text
                            className="group-hover:text-primary"
                            level="span"
                          >
                            {item.name}
                            {item.external && " ↗"}
                          </Text>
                          <br />
                          <Text className="text-xs text-gray-400" level="span">
                            {item.description}
                          </Text>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-gray-300">
                        <Text level="span">{item.name}</Text>
                        <br />
                        <Text className="text-xs text-gray-400" level="span">
                          {item.description}
                        </Text>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className={isMini ? "" : "border-t border-gray-800 pt-8"}>
          <FlexContainer
            className="flex-col md:flex-row justify-between items-center gap-4"
            justifyCenter={false}
          >
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Text
                className="text-gray-400 text-center md:text-left"
                level="p"
              >
                © {currentYear} The Boring Education. All rights reserved.
              </Text>
              <Text className="text-gray-400 hidden md:block" level="span">
                |
              </Text>
              <Text className="text-gray-400" level="p">
                Built with ❤️ in 🇮🇳
              </Text>
            </div>

            <div className="flex items-center gap-4">
              <Text className="text-gray-400 text-xs" level="span">
                Made for developers, by developers
              </Text>
            </div>
          </FlexContainer>
        </div>

        {/* SEO Enhancement */}
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
