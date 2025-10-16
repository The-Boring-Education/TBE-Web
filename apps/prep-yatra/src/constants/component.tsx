import type {NavbarDropdownLink} from "@/interfaces/components";

const socialLinks = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/theboringeducation",
        icon: (
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
        )
    },
    {
        name: "GitHub",
        href: "https://github.com/The-Boring-Education",
        icon: (
            <svg fill='currentColor' viewBox='0 0 24 24' className='w-5 h-5'>
                <path d='M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z' />
            </svg>
        )
    },
    {
        name: "YouTube",
        href: "https://www.youtube.com/@TheBoringEducation",
        icon: (
            <svg fill='currentColor' viewBox='0 0 24 24' className='w-5 h-5'>
                <path d='M21.8 8.001a2.75 2.75 0 0 0-1.93-1.94C18.2 6 12 6 12 6s-6.2 0-7.87.06A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.93 1.94C5.8 18 12 18 12 18s6.2 0 7.87-.06a2.75 2.75 0 0 0 1.93-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999ZM10 15.5v-7l6 3.5-6 3.5Z' />
            </svg>
        )
    }
];

const productLinks = [
    {
        name: "The Boring Education",
        href: "https://www.theboringeducation.com/"
    }
];

const CONFETTI_COLORS = [
    "#facc15", // yellow-400
    "#38bdf8", // sky-400
    "#4ade80", // green-400
    "#f472b6", // pink-400
    "#fff", // white
    "#f59e42", // custom orange
    "#818cf8" // indigo-400
];

const links: NavbarDropdownLink[] = [
    {
        name: "Explore Courses",
        href: "https://www.theboringeducation.com/shiksha",
        description: "Learn Tech with Courses"
    },
    {
        name: "Tech Yatra",
        href: "https://techyatra.netlify.app/",
        description: "Start Tech Journey"
    },
    {
        name: "Resume Yatra",
        href: "https://resumeyatra.netlify.app/",
        description: "Fix Your Resume"
    },
    {
        name: "DSA Yatra",
        href: "https://dsa-yatra.lovable.app",
        description: "Start DSA Journey"
    }
];

export {CONFETTI_COLORS, links,productLinks, socialLinks};
