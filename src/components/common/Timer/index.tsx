import { Text } from '@/components';
import { TimerItemProps } from '@/interfaces';

const TimerItem = ({ timer }: TimerItemProps) => (
  <div className='rounded-1 border border-primary p-0.5 sm:p-1'>
    <Text level='p' className='strong-text text-primary'>
      {timer}
    </Text>
  </div>
);

export default TimerItem;
