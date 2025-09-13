import { FlexContainer, Image, Text } from '@/components';
import type { IconPillProps } from '@/interfaces';

const IconPill = ({
  iconPath,
  iconAltText,
  label,
  className,
  backgroundColor = 'bg-dark',
  labelColor,
}: IconPillProps) => (
  <FlexContainer
    className={`gap-2 rounded-1 ${backgroundColor} p-2 ${className}`}
  >
    <Image alt={iconAltText} className='w-4' fullWidth={false} src={iconPath} />
    <Text className={`strong-text ${labelColor}`} level='p'>
      {label}
    </Text>
  </FlexContainer>
);

export default IconPill;
