import React from "react";
import {motion} from "framer-motion";

import {FlexContainer, Link, Text} from "@tbe/components";
import {socialLinks, productLinks} from "@tbe/constants";

const PrepYatraFooter = () => {
    return (
        <motion.footer
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className='py-4 px-4 border-t border-gray-200 bg-gray-50'>
            <div className='container mx-auto max-w-6xl'>
                <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8'>
                    {/* Left: Brand and Socials */}
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-col gap-0'>
                            <Text level='span' className='text-xl font-bold text-primary'>
                                PrepYatra
                            </Text>
                            <Text level='span' className='text-xs text-gray-500'>
                                By The Boring Education
                            </Text>
                        </div>
                        <div className='flex gap-3 mt-1'>
                            {socialLinks.map((link) => {
                                const getIcon = (iconName: string) => {
                                    switch (iconName) {
                                        case 'instagram':
                                            return (
                                                <svg
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    stroke='currentColor'
                                                    className='w-5 h-5'>
                                                    <rect
                                                        width='20'
                                                        height='20'
                                                        x='2'
                                                        y='2'
                                                        rx='5'
                                                        strokeWidth='2'
                                                    />
                                                    <circle cx='12' cy='12' r='5' strokeWidth='2' />
                                                    <circle cx='17.5' cy='6.5' r='1.5' fill='currentColor' />
                                                </svg>
                                            );
                                        case 'github':
                                            return (
                                                <svg fill='currentColor' viewBox='0 0 24 24' className='w-5 h-5'>
                                                    <path d='M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z' />
                                                </svg>
                                            );
                                        case 'youtube':
                                            return (
                                                <svg fill='currentColor' viewBox='0 0 24 24' className='w-5 h-5'>
                                                    <path d='M21.8 8.001a2.75 2.75 0 0 0-1.93-1.94C18.2 6 12 6 12 6s-6.2 0-7.87.06A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.93 1.94C5.8 18 12 18 12 18s6.2 0 7.87-.06a2.75 2.75 0 0 0 1.93-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999ZM10 15.5v-7l6 3.5-6 3.5Z' />
                                                </svg>
                                            );
                                        default:
                                            return null;
                                    }
                                };

                                return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target='_blank'
                                    className='text-gray-500 hover:text-primary transition-colors'
                                    aria-label={link.name}>
                                        {getIcon(link.icon)}
                                </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Contribute and Products in single row */}
                    <div className='flex flex-col sm:flex-row gap-6 lg:gap-8'>
                        {/* Contribute Section */}
                        <div className='flex flex-col gap-1.5'>
                            <Text level='span' className='text-gray-600 font-semibold text-xs uppercase tracking-wide'>
                                Contribute
                            </Text>
                            <Link
                                href='https://github.com/The-Boring-Education/prep-yatra/issues'
                                target='_blank'
                                className='text-gray-700 hover:text-primary transition-colors text-xs font-medium flex items-center gap-1.5'>
                                <svg
                                    fill='currentColor'
                                    viewBox='0 0 24 24'
                                    className='w-3.5 h-3.5'>
                                    <path d='M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z' />
                                </svg>
                                Contribute to PrepYatra
                            </Link>
                        </div>

                        {/* Products Section */}
                        <div className='flex flex-col gap-1.5'>
                            <Text level='span' className='text-gray-600 font-semibold text-xs uppercase tracking-wide'>
                                Our Products
                            </Text>
                            {productLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target='_blank'
                                    className='text-gray-700 hover:text-primary transition-colors text-xs font-medium'>
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Built with love - Compact Bottom */}
                <div className='mt-4 pt-3 border-t border-gray-200'>
                    <Text level='p' className='text-gray-500 text-center text-xs'>
                        Built with <span className='text-red-500'>❤️</span> by{" "}
                        <Link
                            href='https://theboringeducation.com'
                            target='_blank'
                            className='text-primary font-semibold hover:underline'>
                            The Boring Education
                        </Link>
                    </Text>
                </div>
            </div>
        </motion.footer>
    );
};

export default PrepYatraFooter;
