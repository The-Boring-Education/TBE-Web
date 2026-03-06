import { MDXRenderer, Pill } from '@tbe/components';
import { useMemo, useEffect, useState } from 'react';

interface Section {
    id: string;
    title: string;
    content: string;
    iconPath: string;
    gradient: string;
    borderGlow: string;
    borderColor: string;
    hoverGlow: string;
    titleColor: string;
    delay: number;
}

interface InterviewQuestionContentProps {
    questionTitle: string;
    question: string;
    answer: string;
    frequency?: string;
    priority?: string;
    companyTypes?: string[];
    actions?: React.ReactNode[];
}

// SVG icon paths (24x24 viewBox)
const ICON_PATHS = {
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    target: 'M12 8V4l8 8-8 8v-4H4V8h8zm-2 2H6v4h4v2.5L14.5 12 10 7.5V10z',
    lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

const SECTION_CONFIG: Record<
    string,
    { iconPath: string; gradient: string; borderGlow: string; borderColor: string; hoverGlow: string; titleColor: string }
> = {
    Introduction: {
        iconPath: ICON_PATHS.book,
        gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
        borderGlow: 'rgba(56, 189, 248, 0.3)',
        borderColor: 'rgba(56, 189, 248, 0.15)',
        hoverGlow: 'rgba(56, 189, 248, 0.12)',
        titleColor: '#38bdf8',
    },
    'Detailed Answer': {
        iconPath: ICON_PATHS.brain,
        gradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
        borderGlow: 'rgba(168, 85, 247, 0.3)',
        borderColor: 'rgba(168, 85, 247, 0.15)',
        hoverGlow: 'rgba(168, 85, 247, 0.12)',
        titleColor: '#a855f7',
    },
    'How to Answer in an Interview': {
        iconPath: ICON_PATHS.target,
        gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
        borderGlow: 'rgba(52, 211, 153, 0.3)',
        borderColor: 'rgba(52, 211, 153, 0.15)',
        hoverGlow: 'rgba(52, 211, 153, 0.12)',
        titleColor: '#34d399',
    },
    'Real-Life Example': {
        iconPath: ICON_PATHS.lightbulb,
        gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
        borderGlow: 'rgba(251, 191, 36, 0.3)',
        borderColor: 'rgba(251, 191, 36, 0.15)',
        hoverGlow: 'rgba(251, 191, 36, 0.12)',
        titleColor: '#fbbf24',
    },
    'Code Example': {
        iconPath: ICON_PATHS.code,
        gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
        borderGlow: 'rgba(251, 113, 133, 0.3)',
        borderColor: 'rgba(251, 113, 133, 0.15)',
        hoverGlow: 'rgba(251, 113, 133, 0.12)',
        titleColor: '#fb7185',
    },
};

function parseSections(answer: string): Section[] {
    const sections: Section[] = [];
    const regex = /^#{2,5}\s+(.+)$/gm;
    let match;
    const matches: { title: string; index: number }[] = [];

    while ((match = regex.exec(answer)) !== null) {
        // Safe-check: ignore any headers if we are currently inside a markdown code block
        const beforeMatch = answer.substring(0, match.index);
        const codeFences = (beforeMatch.match(/```/g) || []).length;
        if (codeFences % 2 !== 0) {
            continue;
        }

        matches.push({ title: match[1].trim(), index: match.index });
    }

    if (matches.length === 0) {
        return [{
            id: 'answer',
            title: 'Answer',
            content: answer.trim(),
            iconPath: ICON_PATHS.doc,
            gradient: 'from-gray-500/10 via-gray-500/5 to-transparent',
            borderGlow: 'rgba(156, 163, 175, 0.3)',
            borderColor: 'rgba(156, 163, 175, 0.15)',
            hoverGlow: 'rgba(156, 163, 175, 0.12)',
            titleColor: '#9ca3af',
            delay: 0,
        }];
    }

    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i].title.length + answer.substring(matches[i].index).match(/^#{2,5}\s+/)?.[0].length!;
        const end = i + 1 < matches.length ? matches[i + 1].index : answer.length;
        const content = answer.slice(start, end).trim();
        const title = matches[i].title;

        const config = SECTION_CONFIG[title] || {
            iconPath: ICON_PATHS.doc,
            gradient: 'from-gray-500/10 via-gray-500/5 to-transparent',
            borderGlow: 'rgba(156, 163, 175, 0.3)',
            borderColor: 'rgba(156, 163, 175, 0.15)',
            hoverGlow: 'rgba(156, 163, 175, 0.12)',
            titleColor: '#9ca3af',
        };

        sections.push({
            id: title.toLowerCase().replace(/\s+/g, '-'),
            title,
            content,
            iconPath: config.iconPath,
            gradient: config.gradient,
            borderGlow: config.borderGlow,
            borderColor: config.borderColor,
            hoverGlow: config.hoverGlow,
            titleColor: config.titleColor,
            delay: i * 0.12,
        });
    }

    return sections;
}

/* Glowing SVG icon component */
const GlowIcon = ({ path, color }: { path: string; color: string }) => (
    <div className="section-icon-wrap" style={{ '--icon-color': color } as React.CSSProperties}>
        {/* Glow layer behind the icon */}
        <div className="section-icon-glow" />
        <svg
            className="section-icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d={path} />
        </svg>
    </div>
);

const SectionCard = ({
    section,
    index,
    isVisible,
}: {
    section: Section;
    index: number;
    isVisible: boolean;
}) => {
    return (
        <div
            className="interview-section-card"
            style={
                {
                    '--delay': `${section.delay}s`,
                    '--border-glow': section.borderGlow,
                    '--border-color': section.borderColor,
                    '--hover-glow': section.hoverGlow,
                    '--title-color': section.titleColor,
                    animationDelay: `${section.delay}s`,
                } as React.CSSProperties
            }
            data-visible={isVisible}
        >
            {/* Glow border effect */}
            <div className="section-glow-border" />
            {/* Background glow on hover */}
            <div className="section-bg-glow" />

            {/* Glass card content */}
            <div className={`section-glass-inner bg-gradient-to-br ${section.gradient}`}>
                {/* Section header */}
                <div className="section-header">
                    <GlowIcon path={section.iconPath} color={section.titleColor} />
                    <h3 className="section-title" style={{ color: section.titleColor }}>{section.title}</h3>
                    <div className="section-line" style={{ background: `linear-gradient(90deg, ${section.borderColor}, transparent)` }} />
                </div>

                {/* Section content */}
                <div className="section-content">
                    <MDXRenderer theme="dark" mdxSource={section.content} />
                </div>
            </div>
        </div>
    );
};

const InterviewQuestionContent = ({
    questionTitle,
    question,
    answer,
    frequency,
    priority,
    companyTypes,
    actions,
}: InterviewQuestionContentProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [contentKey, setContentKey] = useState(0);

    const sections = useMemo(() => parseSections(answer || ''), [answer]);

    // Reset animation when question changes
    useEffect(() => {
        setIsVisible(false);
        setContentKey((prev) => prev + 1);
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, [answer]);

    return (
        <div className="interview-content-wrapper" key={contentKey}>
            {/* Question Header */}
            <div
                className="question-header-card"
                data-visible={isVisible}
            >
                <div className="question-header-glow" />
                <div className="question-header-inner">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {frequency && (
                            <Pill
                                text={frequency}
                                variant="PRIMARY"
                                containerClasses="!bg-primary/20"
                                textStyleClasses="!text-primary-light"
                            />
                        )}
                        {priority && (
                            <Pill
                                text={`Priority: ${priority}`}
                                variant="SECONDARY"
                                containerClasses="!bg-secondary/20"
                                textStyleClasses="!text-secondary-light"
                            />
                        )}
                        {companyTypes?.map((ct) => (
                            <Pill
                                key={ct}
                                text={ct}
                                variant="GHOST"
                                containerClasses="!bg-gray-800 border border-gray-700"
                                textStyleClasses="!text-gray-300"
                            />
                        ))}
                    </div>

                    {/* Question title */}
                    <h1 className="question-main-title">{questionTitle}</h1>
                    <p className="question-subtitle">{question}</p>
                </div>
            </div>

            {/* Sections */}
            <div className="sections-container">
                {sections.map((section, index) => (
                    <SectionCard
                        key={`${contentKey}-${section.id}`}
                        section={section}
                        index={index}
                        isVisible={isVisible}
                    />
                ))}
            </div>

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div
                    className="actions-card"
                    data-visible={isVisible}
                    style={{ animationDelay: `${sections.length * 0.12 + 0.1}s` }}
                >
                    <div className="flex flex-wrap items-center gap-0">
                        {actions}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewQuestionContent;
