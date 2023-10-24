import {
  AdminDashboardCardContainer,
  FlexContainer,
  SEO,
  Section,
  SectionHeaderContainer,
  Text,
  withAuth,
} from '@/components';
import { PageProps, PageSlug } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { getSEOMeta, authHOCConfig } from '@/constant';
import { useAdmin } from '@/hooks';

const Admin = ({ user }: PageProps) => {
  const slug: PageSlug = '/admin';
  const seoMeta = getSEOMeta(slug as PageSlug);
  const { loading } = useAdmin(user?.email);

  if (loading) return;

  return (
    <Section>
      <SEO seoMeta={seoMeta} />
      <FlexContainer justifyCenter={true} className='py-6' direction='col'>
        <FlexContainer direction='col' className='gap-3'>
          <FlexContainer direction='col'>
            <SectionHeaderContainer
              headingLevel={2}
              heading='Hello'
              focusText={user?.name ?? ''}
            />
            <Text level='p' className='paragraph mt-1' textCenter={true}>
              What would like to do today?
            </Text>
          </FlexContainer>
          <AdminDashboardCardContainer />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export const getServerSideProps = getPreFetchProps;

export default withAuth(Admin, authHOCConfig.admin);
