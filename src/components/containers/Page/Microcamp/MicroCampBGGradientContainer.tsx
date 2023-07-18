import { MicroCampBGGradientContainerProps } from '@/interfaces';

const MicroCampBGGradientContainer = ({
  children,
}: MicroCampBGGradientContainerProps) => {
  return <div className='gradient-6 rounded-2'>{children}</div>;
};

export default MicroCampBGGradientContainer;
