import { CircularProgressBarProps } from '@/interfaces';

const CircularProgressBar = ({
  percentage,
  color = '#6366f1',
  size = 56,
  strokeWidth = 6,
  children,
  bg = '#e5e7eb',
  className = '',
}: CircularProgressBarProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-block ${className}`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bg}
          strokeWidth={strokeWidth}
          fill='none'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div
        className='absolute inset-0 flex items-center justify-center'
        style={{ pointerEvents: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default CircularProgressBar;
