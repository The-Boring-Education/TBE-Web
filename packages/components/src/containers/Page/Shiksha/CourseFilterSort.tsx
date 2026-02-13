import { FlexContainer, Text } from '@tbe/components';
import { useState } from 'react';

export interface CourseFilterSortProps {
    onFilterChange: (filters: {
        difficulty: string;
        topic: string;
    }) => void;
    onSortChange: (sort: string) => void;
}

const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const TOPIC_OPTIONS = ['All', 'Frontend', 'Backend', 'Fullstack', 'Tech'];
const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Most Chapters', value: 'chapters-desc' },
    { label: 'Fewest Chapters', value: 'chapters-asc' },
    { label: 'Difficulty (Easy → Hard)', value: 'difficulty-asc' },
];

const selectClasses =
    'bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none min-w-[160px]';

const labelClasses = 'text-gray-400 text-xs font-medium mb-1';

const CourseFilterSort = ({
    onFilterChange,
    onSortChange,
}: CourseFilterSortProps) => {
    const [difficulty, setDifficulty] = useState('All');
    const [topic, setTopic] = useState('All');
    const [sort, setSort] = useState('newest');

    const handleDifficultyChange = (value: string) => {
        setDifficulty(value);
        onFilterChange({ difficulty: value, topic });
    };

    const handleTopicChange = (value: string) => {
        setTopic(value);
        onFilterChange({ difficulty, topic: value });
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        onSortChange(value);
    };

    const hasActiveFilters = difficulty !== 'All' || topic !== 'All';

    const handleReset = () => {
        setDifficulty('All');
        setTopic('All');
        setSort('newest');
        onFilterChange({ difficulty: 'All', topic: 'All' });
        onSortChange('newest');
    };

    return (
        <div className='w-full mb-6 px-2'>
            <FlexContainer
                className='flex-col sm:flex-row gap-4 items-start sm:items-end flex-wrap'
            >
                {/* Difficulty Filter */}
                <div className='flex flex-col'>
                    <label className={labelClasses}>Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => handleDifficultyChange(e.target.value)}
                        className={selectClasses}
                    >
                        {DIFFICULTY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Topic Filter */}
                <div className='flex flex-col'>
                    <label className={labelClasses}>Topic</label>
                    <select
                        value={topic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className={selectClasses}
                    >
                        {TOPIC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div className='flex flex-col'>
                    <label className={labelClasses}>Sort by</label>
                    <select
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className={selectClasses}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className='text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors py-2'
                    >
                        Reset Filters
                    </button>
                )}
            </FlexContainer>
        </div>
    );
};

export default CourseFilterSort;
