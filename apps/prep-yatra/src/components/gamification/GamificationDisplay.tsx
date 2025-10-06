import {useRef, useState, useEffect} from "react";

import {useGamification} from "@/hooks/usePyGamification";

const GamificationDisplay = ({userId}: { userId: string }) => {
    const {
        points,
        currentLevel,
        currentLevelName,
        nextLevelName,
        pointsNeededForNextLevel,
        percentageProgress,
        loading
    } = useGamification(userId);

    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (loading) {return null;}

    return (
        <div className='relative' ref={popoverRef}>
            <button
                className='flex p-1 w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary font-bold'
                onClick={() => setOpen((v) => !v)}>
                <span className='w-full h-full flex text-xs items-center justify-center'>
                    {points}
                </span>
            </button>

            {open && (
                <div className='absolute z-50 mt-2 left-1/2 -translate-x-1/2'>
                    <div className='bg-white rounded-2xl shadow-lg border px-4 py-4 w-[260px]'>
                        <div className='flex items-center gap-4 justify-between'>
                            {/* Progress Circle */}
                            <div className='w-[64px] h-[64px] flex items-center justify-center'>
                                <svg width={64} height={64}>
                                    <circle
                                        cx={32}
                                        cy={32}
                                        r={28}
                                        stroke='#e5e7eb'
                                        strokeWidth={5}
                                        fill='none'
                                    />
                                    <circle
                                        cx={32}
                                        cy={32}
                                        r={28}
                                        stroke='#f97316'
                                        strokeWidth={5}
                                        fill='none'
                                        strokeDasharray={2 * Math.PI * 28}
                                        strokeDashoffset={
                                            2 *
                                            Math.PI *
                                            28 *
                                            (1 - percentageProgress / 100)
                                        }
                                        strokeLinecap='round'
                                        style={{
                                            transition:
                                                "stroke-dashoffset 0.4s ease"
                                        }}
                                    />
                                    <text
                                        x='50%'
                                        y='50%'
                                        textAnchor='middle'
                                        dy='.3em'
                                        fontSize='14px'
                                        fill='#f97316'
                                        fontWeight='bold'>
                                        {points}
                                    </text>
                                </svg>
                            </div>

                            {/* Info */}
                            <div className='flex flex-col items-start'>
                                <span className='text-sm text-gray-500 font-medium'>
                                    YOU'RE AT
                                </span>
                                <span className='text-base font-semibold text-primary'>
                                    Level {currentLevel} : {currentLevelName}
                                </span>
                                {nextLevelName && (
                                    <span className='mt-2 text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-pink-500 to-yellow-400'>
                                        {pointsNeededForNextLevel} Points to{" "}
                                        {nextLevelName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamificationDisplay;
