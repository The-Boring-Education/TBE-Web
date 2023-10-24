import { FlexContainer, Link, Text } from '@/components';
import { AdminDashboardCardProps } from '@/interfaces';

const AdminDashboardCard = ({
  heading,
  subtitle,
  link,
}: AdminDashboardCardProps) => {
  return (
    <Link href={link}>
      <FlexContainer
        direction='col'
        itemCenter={false}
        className='cursor-pointer rounded-lg border border-grey px-4 py-3 hover:bg-slate-200'
      >
        <Text level='h5' className='heading-5'>
          {heading}
        </Text>
        <Text level='p' className='strong-text text-grey'>
          {subtitle}
        </Text>
      </FlexContainer>
    </Link>
  );
};

export default AdminDashboardCard;
