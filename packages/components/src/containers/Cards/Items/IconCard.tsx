import { motion } from 'framer-motion';

import type { IconCardProps } from '@tbe/interface';

const IconCard = ({
  icon,
  title,
  description,
  className = 'p-6 hover:shadow-xl transition-shadow duration-300 h-full',
  bgColor = 'bg-white',
  index = 0,
}: IconCardProps) => (
  <motion.div
    className='h-full'
    initial={{ opacity: 0, y: 20 }}
    transition={{ delay: index * 0.2 }}
    viewport={{ once: true }}
    whileInView={{ opacity: 1, y: 0 }}
  >
    <div
      className={`${bgColor} rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className='mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold mb-2 text-contentLight'>{title}</h3>
      <p className='text-greyDark'>{description}</p>
    </div>
  </motion.div>
);

export default IconCard;
