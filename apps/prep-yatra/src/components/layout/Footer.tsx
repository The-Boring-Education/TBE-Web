import React from "react";
import {motion} from "framer-motion";

import {FlexContainer, Link, Text} from "@tbe/components";
import {socialLinks, productLinks} from "@/constants";

const Footer = () => {
    return (
        <motion.footer
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className='pt-6 px-3 border-t border-greyLight bg-white'>
            <div className='container mx-auto flex flex-col gap-6'>
                <FlexContainer
                    direction='col'
                    className='lg:flex-row items-start justify-between gap-8 w-full'
                    itemCenter={false}>
                    {/* Left: Brand and Socials */}
                    <FlexContainer
                        direction='col'
                        className='items-start gap-3 w-full lg:w-1/2'
                        itemCenter={false}>
                        <FlexContainer direction='col' className='gap-[2px]' itemCenter={false}>
                            <Text level='span' className='text-2xl font-bold text-primary'>
                                PrepYatra
                            </Text>
                            <Text level='span' className='text-[11px] text-greyDark'>
                                By The Boring Education
                            </Text>
                        </FlexContainer>
                        <FlexContainer className='gap-3 mt-2' justifyCenter={false}>
                            {socialLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target='_blank'
                                    className='text-greyDark hover:text-primary transition-colors'
                                    aria-label={link.name}>
                                    {link.icon}
                                </Link>
                            ))}
                        </FlexContainer>
                    </FlexContainer>

                    {/* Right: Contribute and Products Sections Side-by-Side */}
                    <FlexContainer
                        direction='col'
                        className='w-full lg:w-1/2 lg:flex-row lg:justify-end gap-8'
                        itemCenter={false}>
                        {/* Contribute Section */}
                        <FlexContainer
                            direction='col'
                            className='gap-2 w-full lg:w-auto'
                            itemCenter={false}>
                            <Text level='span' className='text-greyDark font-semibold text-xs mb-1 text-left'>
                                Contribute
                            </Text>
                            <FlexContainer
                                direction='col'
                                className='gap-2 items-start text-left lg:items-end lg:text-right'
                                itemCenter={false}>
                                <Link
                                    href='https://github.com/The-Boring-Education/prep-yatra/issues'
                                    target='_blank'
                                    className='text-contentLight hover:text-primary transition-colors text-xs font-medium flex items-center gap-2'>
                                    <svg
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                        className='w-4 h-4'>
                                        <path d='M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z' />
                                    </svg>
                                    Contribute to PrepYatra
                                </Link>
                            </FlexContainer>
                        </FlexContainer>

                        {/* Products Section */}
                        <FlexContainer
                            direction='col'
                            className='gap-2 w-full lg:w-auto'
                            itemCenter={false}>
                            <Text level='span' className='text-greyDark font-semibold text-xs mb-1 text-left'>
                                Our Products
                            </Text>
                            <FlexContainer
                                direction='col'
                                className='gap-2 items-start text-left lg:items-end lg:text-right'
                                itemCenter={false}>
                                {productLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        target='_blank'
                                        className='text-contentLight hover:text-primary transition-colors text-xs font-medium'>
                                        {link.name}
                                    </Link>
                                ))}
                            </FlexContainer>
                        </FlexContainer>
                    </FlexContainer>
                </FlexContainer>

                {/* Built with love - Center Bottom */}
                <FlexContainer className='py-3 border-t border-greyLight'>
                    <Text level='p' className='text-greyDark text-center text-xs'>
                        Built with <span className='text-red-500'>❤️</span> by{" "}
                        <Link
                            href='https://theboringeducation.com'
                            target='_blank'
                            className='text-primary font-semibold hover:underline'>
                            The Boring Education
                        </Link>
                    </Text>
                </FlexContainer>
            </div>
        </motion.footer>
    );
};

export default Footer;
