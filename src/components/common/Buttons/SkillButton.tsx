import React from 'react';
import { SkillButtonProps } from '@/interfaces';

const SkillButton = ({ skill, isSelected, onClick }: SkillButtonProps) => {
  return (
    <label className='cursor-pointer'>
      <input
        type='radio'
        name='skill'
        className='hidden'
        checked={isSelected}
        onChange={() => onClick(skill)}
      />
      <div
        className={`px-4 py-1 font-bold rounded-lg transition-all duration-300 ${
          isSelected
            ? 'bg-primary text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-black'
        }`}
      >
        {skill}
      </div>
    </label>
  );
};

export default SkillButton;
