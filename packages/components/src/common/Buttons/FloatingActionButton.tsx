import type { FloatingActionButtonProps } from '@tbe/interface';

const FloatingActionButton = ({
  icon,
  onClick,
  className = '',
}: FloatingActionButtonProps) => (
  <button
    aria-label='Floating Action Button'
    className={`fixed bottom-2 right-2 md:bottom-4 md:right-4 z-[99999] p-2 md:p-3 rounded-full shadow-lg bg-primary text-white transition-all pointer-events-auto ${className}`}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default FloatingActionButton;
