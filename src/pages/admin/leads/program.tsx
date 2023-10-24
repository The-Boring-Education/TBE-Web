import {
  FlexContainer,
  ProgramLeadsCard,
  SEO,
  Section,
  SectionHeaderContainer,
  Text,
  withAuth,
} from '@/components';
import { PageSlug, CohortLeadCard } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { apiUrls, authHOCConfig, getSEOMeta } from '@/constant';
import { useApi } from '@/hooks';

const AdminProgramLeadsDashboard = () => {
  const slug: PageSlug = '/admin';
  const seoMeta = getSEOMeta(slug as PageSlug);
  const { data: cohortLeadData, loading } = useApi({
    method: 'GET',
    url: apiUrls.leadCohort,
  });

  if (loading || !cohortLeadData) return;

  const programLeads: CohortLeadCard[] = cohortLeadData.data;

  console.log('HERE', programLeads);

  return (
    <Section>
      <SEO seoMeta={seoMeta} />
      <FlexContainer justifyCenter={true} className='py-6' direction='col'>
        <FlexContainer direction='col' className='gap-3'>
          <FlexContainer direction='col'>
            <SectionHeaderContainer
              headingLevel={2}
              heading='Program'
              focusText='Leads'
            />
            <Text level='p' className='paragraph mt-1' textCenter={true}>
              The list of all program leads.
            </Text>
          </FlexContainer>
          <FlexContainer direction='col'>
            <FlexContainer className='flex-wrap gap-4 py-6'>
              {programLeads.map((programLead, key) => {
                return <ProgramLeadsCard key={key} {...programLead} />;
              })}
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export const getServerSideProps = getPreFetchProps;

export default withAuth(AdminProgramLeadsDashboard, authHOCConfig.admin);
