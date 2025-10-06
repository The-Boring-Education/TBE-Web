import React from "react";

import {socialLinks, productLinks} from "@tbe/constants";

const PrepYatraFooter = () => {
    return (
        <footer className='pt-8 px-4 border-t border-white/10 bg-gray-900/90 backdrop-blur-md'>
            <div className='container mx-auto flex flex-col gap-6'>
                <div className='flex flex-col lg:flex-row items-start justify-between gap-8 w-full'>
                    {/* Left: Brand and Socials */}
                    <div className='flex flex-col items-start gap-3 w-full lg:w-1/2'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-3xl font-bold text-primary'>
                                PrepYatra
                            </span>
                            <span className='text-xs text-white'>
                                By The Boring Education
                            </span>
                        </div>
                        <div className='flex gap-4 mt-2'>
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gray-400 hover:text-primary transition-colors'
                                    aria-label={link.name}>
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right: Contribute and Products Sections Side-by-Side */}
                    <div className='w-full lg:w-1/2 flex flex-col lg:flex-row lg:justify-end gap-10'>
                        {/* Contribute Section */}
                        <div className='flex flex-col gap-2 w-full lg:w-auto'>
                            <span className='text-gray-400 font-semibold text-sm mb-1 text-left'>
                                Contribute
                            </span>
                            <div className='flex flex-col gap-2 items-start text-left lg:items-end lg:text-right'>
                                <a
                                    href='https://github.com/The-Boring-Education/prep-yatra/issues'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gray-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2'>
                                    <svg
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                        className='w-4 h-4'>
                                        <path d='M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z' />
                                    </svg>
                                    Contribute to PrepYatra
                                </a>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className='flex flex-col gap-2 w-full lg:w-auto'>
                            <span className='text-gray-400 font-semibold text-sm mb-1 text-left'>
                                Our Products
                            </span>
                            <div className='flex flex-col gap-2 items-start text-left lg:items-end lg:text-right'>
                                {productLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-gray-400 hover:text-primary transition-colors text-sm font-medium'>
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Built with love - Center Bottom */}
                <div className='flex justify-center py-4 border-t border-white/10'>
                    <p className='text-gray-400 text-center text-sm'>
                        Built with <span className='text-red-500'>❤️</span> by{" "}
                        <a
                            href='https://theboringeducation.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary font-semibold hover:underline'>
                            The Boring Education
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PrepYatraFooter;
