import { FC } from 'react';
import { motion } from 'framer-motion';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const Checkbox: FC<CheckboxProps> = ({ label, checked, onChange, className = '' }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${className}`}
      onClick={onChange}
    >
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-4 h-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className="text-sm">{label}</span>
    </motion.div>
  );
};

export default Checkbox;