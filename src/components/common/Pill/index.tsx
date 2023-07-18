import { Text } from '@/components';
import { PillProps } from '@/interfaces';

const Pill = ({
  text,
  variant,
  textStyleClasses,
  containerClasses,
}: PillProps) => {
  let backgroundColor;

  if (variant === 'PRIMARY') backgroundColor = 'bg-primary';
  else if (variant === 'SECONDARY') backgroundColor = 'bg-secondary';

  return (
    <div
      className={`rounded-1 ${backgroundColor} px-2 py-1 ${containerClasses}`}
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
