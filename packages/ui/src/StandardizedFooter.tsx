import React from 'react'
import { Logo, Link, Text } from '@tbe/ui'
import { FaGithub, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'

interface StandardizedFooterProps {
  variant?: 'platform' | 'prep-yatra' | 'quizes' | 'onboarding'
  showProducts?: boolean
  customLinks?: Array<{
    title: string
    links: Array<{ name: string; href: string; description?: string }>
  }>
}

/**
 * Standardized Footer Component
 * 
 * Provides consistent footer across all TBE apps while allowing customization
 * Based on the platform (tbe-webapp) baseline design
 */
export default function StandardizedFooter({ 
  variant = 'platform',
  showProducts = true,
  customLinks = []
}: StandardizedFooterProps) {
  const currentYear = new Date().getFullYear()

  const getAppSpecificStyles = () => {
    switch (variant) {
      case 'prep-yatra':
        return 'bg-primary-900 text-primary-50'
      case 'quizes':
        return 'bg-purple-900 text-purple-50'
      case 'onboarding':
        return 'bg-blue-900 text-blue-50'
      default:
        return 'bg-gray-900 text-gray-50'
    }
  }

  const defaultProducts = [
    {
      name: 'Shiksha',
      href: '/shiksha',
      description: 'Free Courses',
    },
    {
      name: 'Interview Prep',
      href: '/interview-prep',
      description: 'Tech Interviews',
    },
    {
      name: 'YouFocus',
      href: '/youfocus',
      description: 'YouTube Learning',
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      description: 'Portfolio Builder',
    },
    {
      name: 'Prep Yatra',
      href: 'https://prepyatra.theboringeducation.com',
      description: 'Career Navigation',
    },
    {
      name: 'Quiz Platform',
      href: 'https://quizes.theboringeducation.com',
      description: 'Skill Testing',
    }
  ]

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Contribute', href: '/contribute' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
    { name: 'Refund Policy', href: '/refund' }
  ]

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/theboringeducation', icon: FaGithub },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/theboringeducation', icon: FaLinkedin },
    { name: 'YouTube', href: 'https://youtube.com/@theboringeducation', icon: FaYoutube },
    { name: 'Instagram', href: 'https://instagram.com/theboringeducation', icon: FaInstagram }
  ]

  const getAppSpecificMessage = () => {
    switch (variant) {
      case 'prep-yatra':
        return 'Navigate your career journey with confidence'
      case 'quizes':
        return 'Test and improve your skills continuously'
      case 'onboarding':
        return 'Start your learning journey with us'
      default:
        return 'Democratizing education through technology'
    }
  }

  return (
    <footer className={`${getAppSpecificStyles()} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Logo className="h-8 w-auto" />
              <Text variant="h6" className="font-bold">
                The Boring Education
              </Text>
            </div>
            <Text variant="body2" className="mb-4 opacity-75">
              {getAppSpecificMessage()}
            </Text>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                    aria-label={social.name}
                  >
                    <IconComponent size={20} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Products */}
          {showProducts && (
            <div>
              <Text variant="h6" className="font-semibold mb-4">
                Products
              </Text>
              <ul className="space-y-2">
                {defaultProducts.map((product) => (
                  <li key={product.name}>
                    <Link
                      href={product.href}
                      className="opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm opacity-75">{product.description}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          <div>
            <Text variant="h6" className="font-semibold mb-4">
              Company
            </Text>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Custom Links */}
          {customLinks.map((section) => (
            <div key={section.title}>
              <Text variant="h6" className="font-semibold mb-4">
                {section.title}
              </Text>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div>
                        <div className="font-medium">{link.name}</div>
                        {link.description && (
                          <div className="text-sm opacity-75">{link.description}</div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-opacity-20 border-white">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Text variant="body2" className="opacity-75">
              © {currentYear} The Boring Education. All rights reserved.
            </Text>
            <Text variant="body2" className="opacity-75">
              Built with ❤️ for learners worldwide
            </Text>
          </div>
        </div>
      </div>
    </footer>
  )
}
