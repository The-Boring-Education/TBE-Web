import { AdminDashboardCard, FlexContainer } from '@/components';
import { ADMIN_DASHBOARD_CARDS } from '@/constant';

const AdminDashboardCardContainer = () => {
  return (
    <FlexContainer direction='col'>
      {ADMIN_DASHBOARD_CARDS.map((card) => {
        const { heading, subtitle, link } = card;

        return (
          <AdminDashboardCard
            key={heading}
            heading={heading}
            subtitle={subtitle}
            link={link}
          />
        );
      })}
    </FlexContainer>
  );
};

export default AdminDashboardCardContainer;
