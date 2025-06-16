import { motion } from 'framer-motion';

import type { OutlineCardProps } from '@/interfaces';

const OutlineCard = ({ icon, title, description }: OutlineCardProps) => (
    <motion.div
      className='bg-gradient-to-br from-card to-card/50 p-8 rounded-xl shadow-md border border-primary/10 hover:border-primary/30 transition-all'
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6'>
        {icon}
      </div>
      <h3 className='text-xl font-semibold mb-4'>{title}</h3>
      <p className='text-muted-foreground'>{description}</p>
    </motion.div>
  );

export default OutlineCard;
