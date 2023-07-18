import { FlexContainer, Image, Text } from '@/components';
import { IconPillProps } from '@/interfaces';

const IconPill = ({
  iconPath,
  iconAltText,
  label,
  className,
  backgroundColor = 'bg-dark',
  labelColor,
}: IconPillProps) => {
  return (
    <FlexContainer
      className={`gap-2 rounded-1 ${backgroundColor} p-2 ${className}`}
    >
      <Image
        src={iconPath}
        className='w-4'
        fullWidth={false}
        alt={iconAltText}
      />
      <Text level='p' className={`strong-text ${labelColor}`}>
        {label}
      </Text>
    </FlexContainer>
  );
};

export default IconPill;
