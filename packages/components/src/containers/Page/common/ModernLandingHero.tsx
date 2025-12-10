import React from 'react';
import {
  Button,
  Section,
  Text,
} from '@tbe/components';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';

interface ModernLandingHeroProps {
  heading: string;
  focusText: string;
  heroText: string;
  primaryButton: React.ReactNode;
  secondaryButton?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  stats?: {
    icon: React.ReactNode;
    text: string;
    color: string;
  }[];
  previewContent?: {
    title: string;
    description: string;
    buttonText: string;
    onPreviewClick?: () => void;
  };
}

const ModernLandingHero = ({
  heading,
  focusText,
  heroText,
  primaryButton,
  secondaryButton,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-purple-700',
  stats,
  previewContent,
}: ModernLandingHeroProps) => (
    <Section className={`bg-lightBG`}>
      <div className='max-w-7xl mx-auto px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
          
          {/* Left: Content */}
          <div className='lg:col-span-2 space-y-6'>
            
            {/* Heading */}
            <div className='space-y-2'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Text className='text-4xl lg:text-5xl font-bold leading-tight' level='h1'>
                  <span className='text-black'>{heading}</span>{' '}
                  <span className='text-primary'>{focusText}</span>
                </Text>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Text level='p' className='text-xl text-gray-600 leading-relaxed'>
                  {heroText}
                </Text>
              </motion.div>
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='flex flex-wrap gap-6 text-sm'
              >
                {stats.map((stat, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-primary'>{stat.icon}</span>
                    <span className='text-gray-600'>{stat.text}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='flex flex-wrap gap-4'
            >
              {React.isValidElement(primaryButton)
                ? React.cloneElement(primaryButton as any, {
                    className: `${(primaryButton as any).props.className || ''} hover:text-primary transition-colors duration-200`.trim(),
                  })
                : primaryButton}

              {React.isValidElement(secondaryButton)
                ? React.cloneElement(secondaryButton as any, {
                    className: `${(secondaryButton as any).props.className || ''} bg-white border-1 border-primary text-black rounded-lg hover:bg-primary/10 focus:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200`.trim(),
                  })
                : secondaryButton}
            </motion.div>
          </div>

          {/* Right: Preview Card */}
          {previewContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className='lg:col-span-1'
            >
              <div className='bg-white rounded-lg shadow-2xl p-6 text-gray-900 transform hover:scale-105 transition-transform duration-300'>
                <div className='aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4'>
                  <FaPlay className='text-4xl text-primary' />
                </div>
                <Text level='p' className='font-semibold mb-2'>{previewContent.title}</Text>
                <Text level='p' className='text-sm text-gray-600 mb-4'>
                  {previewContent.description}
                </Text>
                <Button
                  text={previewContent.buttonText}
                  variant='PRIMARY'
                  className='w-full hover:bg-gray-100 hover:text-primary'
                  onClick={previewContent.onPreviewClick}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Section>
  );

export default ModernLandingHero;