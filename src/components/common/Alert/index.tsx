import type { AlertProps } from '@/interfaces';

const Alert = ({ message, type = 'INFO', className = '' }: AlertProps) => {
  const typeClasses = {
    SUCCESS: {
      background: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: (
        <svg
          className='flex-none fill-current h-4 w-4 text-green-500'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M10 0C4.486 0 0 4.485 0 10s4.486 10 10 10 10-4.485 10-10S15.514 0 10 0zm5 7l-6 6-3-3 1.414-1.414L9 10.172l4.586-4.586L15 7z' />
        </svg>
      ),
    },
    ERROR: {
      background: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: (
        <svg
          className='flex-none fill-current h-4 w-4 text-red-500'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M10 0C4.485 0 0 4.485 0 10s4.485 10 10 10 10-4.485 10-10S15.515 0 10 0zm3.707 13.293l-1.414 1.414L10 11.414l-2.293 2.293-1.414-1.414L8.586 10 6.293 7.707l1.414-1.414L10 8.586l2.293-2.293 1.414 1.414L11.414 10l2.293 2.293z' />
        </svg>
      ),
    },
    WARNING: {
      background: 'bg-yellow-100',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: (
        <svg
          className='flex-none fill-current h-4 w-4 text-yellow-500'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9 12h2v2H9v-2zm0-8h2v6H9V4zm1-4C4.486 0 0 4.485 0 10s4.486 10 10 10 10-4.485 10-10S15.514 0 10 0z' />
        </svg>
      ),
    },
    INFO: {
      background: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: (
        <svg
          className='flex-none fill-current h-4 w-4 text-blue-500'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9 12h2v2H9v-2zm0-8h2v6H9V4zm1-4C4.486 0 0 4.485 0 10s4.486 10 10 10 10-4.485 10-10S15.514 0 10 0z' />
        </svg>
      ),
    },
  };

  // Get the classes for the current alert type
  const { background, border, text, icon } =
    typeClasses[type] || typeClasses.INFO;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`p-1 w-full border-l-4 ${background} ${border}`}>
        <div className='flex gap-2 items-center'>
          {icon}
          <div className={`text-sm ${text}`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
