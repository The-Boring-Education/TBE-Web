/**
 * Social Media Templates & Utilities
 * 
 * Extracted from prep-yatra and made reusable
 * Handles social media sharing functionality
 */

export interface SocialMediaShareData {
    title: string
    text: string
    url: string
    hashtags?: string[]
}

export interface PrepYatraShareData {
    challengeName?: string
    currentDay?: number
    progressText?: string
    nextGoals?: string[]
    totalTime?: number
    streak?: number
}

/**
 * Generate social media templates for various TBE platforms
 */
export const socialMediaTemplates = {
    // PrepYatra challenge progress template
    challengeProgress: (data: PrepYatraShareData): SocialMediaShareData => {
        const { challengeName, currentDay, progressText, nextGoals = [], totalTime, streak } = data
        const appUrl = process.env.NEXT_PUBLIC_PREPYATRA_BASE_URL || 'https://prepyatra.theboringeducation.com'
        
        const goals = nextGoals
            .map((goal, index) => `${index + 1}. ${goal}`)
            .join('\n')

        const text = `Today was Day ${currentDay} of ${challengeName}!

I worked on:
${progressText}

Next goals:
${goals}

${streak ? `Current streak: ${streak} days 🔥` : ''}
${totalTime ? `Total time: ${totalTime} hours ⏰` : ''}

Join me on Prep Yatra 👇`

        return {
            title: `Day ${currentDay} of ${challengeName}`,
            text,
            url: appUrl,
            hashtags: ['PrepYatra', 'TechCareer', 'LearningInPublic', 'CodingChallenge']
        }
    },

    // General prep log template
    prepLogProgress: (data: { title: string; description?: string; timeSpent: number; streak?: number }): SocialMediaShareData => {
        const { title, description, timeSpent, streak } = data
        const appUrl = process.env.NEXT_PUBLIC_PREPYATRA_BASE_URL || 'https://prepyatra.theboringeducation.com'

        const text = `${title}

${description ? `${description}\n` : ''}
⏰ Time spent: ${timeSpent} hours
${streak ? `🔥 Current streak: ${streak} days` : ''}

Building my tech career with Prep Yatra!`

        return {
            title,
            text,
            url: appUrl,
            hashtags: ['PrepYatra', 'TechCareer', 'LearningInPublic']
        }
    },

    // Platform achievement template
    platformAchievement: (data: { achievement: string; metric: number; platform: string }): SocialMediaShareData => {
        const { achievement, metric, platform } = data
        const baseUrl = process.env.NEXT_PUBLIC_TBE_BASE_URL || 'https://theboringeducation.com'

        const text = `🎉 Just ${achievement} on ${platform}!

📊 ${metric} milestone reached
🚀 Building in public with The Boring Education

Join the journey 👇`

        return {
            title: `Achievement Unlocked: ${achievement}`,
            text,
            url: baseUrl,
            hashtags: ['TBE', 'BuildInPublic', 'TechCareer']
        }
    }
}

/**
 * Format text for different social media platforms
 */
export const formatForPlatform = {
    twitter: (data: SocialMediaShareData): string => {
        const maxLength = 280
        const hashtagString = data.hashtags ? ` ${data.hashtags.map(tag => `#${tag}`).join(' ')}` : ''
        const urlLength = 23 // Twitter's t.co URL length
        
        const availableLength = maxLength - urlLength - hashtagString.length - 3 // 3 for spaces
        const truncatedText = data.text.length > availableLength 
            ? `${data.text.substring(0, availableLength - 3)}...`
            : data.text

        return `${truncatedText}\n\n${data.url}${hashtagString}`
    },

    linkedin: (data: SocialMediaShareData): string => {
        const hashtagString = data.hashtags ? `\n\n${data.hashtags.map(tag => `#${tag}`).join(' ')}` : ''
        return `${data.text}\n\n${data.url}${hashtagString}`
    },

    general: (data: SocialMediaShareData): string => {
        return `${data.text}\n\n${data.url}`
    }
}

/**
 * Generate sharing URLs for different platforms
 */
export const generateShareUrls = {
    twitter: (data: SocialMediaShareData): string => {
        const text = formatForPlatform.twitter(data)
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    },

    linkedin: (data: SocialMediaShareData): string => {
        const text = formatForPlatform.linkedin(data)
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&summary=${encodeURIComponent(text)}`
    },

    facebook: (data: SocialMediaShareData): string => {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.text)}`
    },

    whatsapp: (data: SocialMediaShareData): string => {
        const text = formatForPlatform.general(data)
        return `https://wa.me/?text=${encodeURIComponent(text)}`
    },

    telegram: (data: SocialMediaShareData): string => {
        const text = formatForPlatform.general(data)
        return `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`
    }
}

/**
 * Native Web Share API (if supported)
 */
export const nativeShare = async (data: SocialMediaShareData): Promise<boolean> => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: data.title,
                text: data.text,
                url: data.url
            })
            return true
        } catch (error) {
            console.error('Error sharing:', error)
            return false
        }
    }
    return false
}

/**
 * Copy to clipboard fallback
 */
export const copyToClipboard = async (data: SocialMediaShareData): Promise<boolean> => {
    const text = formatForPlatform.general(data)
    
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
    }
}
