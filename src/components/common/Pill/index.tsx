import { Text } from '@/components';
import { PillProps } from '@/interfaces';

const Pill = ({
  text,
  variant,
  textStyleClasses = '',
  containerClasses = '',
  widthFull = false,
}: PillProps) => {
  let backgroundColor;
  let className = '';
  if (variant === 'PRIMARY') backgroundColor = 'bg-primary';
  else if (variant === 'SECONDARY') backgroundColor = 'bg-secondary';
  else if (variant === 'GHOST') {
    className = 'bg-white strong-text';
  }

  return (
    <div
      className={`rounded-1 ${backgroundColor} px-2 py-1 ${containerClasses} ${
        widthFull && 'w-full'
      } ${className}`}
    >
      <Text
        level='p'
        className={`strong-text ${textStyleClasses}`}
        textCenter={true}
      >
        {text}
      </Text>
    </div>
  );
};

export default Pill;
