import { FlexContainer, LinkButton, SelectInput, Text } from '@/components';
import {
  apiUrls,
  programLeadStatusList,
  sendMessageToWhatsappURL,
} from '@/constant';
import { useApi } from '@/hooks';
import { CohortLeadCard } from '@/interfaces';
import { formatDate } from '@/utils';

const ProgramLeadsCard = ({
  _id,
  name,
  email,
  contactNo,
  cohortName,
  profession,
  school,
  college,
  workExperience,
  status,
  createdAt,
  updatedAt,
}: CohortLeadCard) => {
  const { makeRequest } = useApi();

  const handleUpdateLeadStatus = (value: string) => {
    makeRequest({
      method: 'PATCH',
      url: apiUrls.leadCohort,
      body: {
        id: _id,
        status: value,
      },
    });
  };

  return (
    <FlexContainer
      direction='col'
      itemCenter={false}
      justifyCenter={true}
      className='gap-3 rounded-lg border border-black p-2'
    >
      <FlexContainer
        direction='col'
        itemCenter={false}
        justifyCenter={false}
        className='items-start justify-start gap-1'
      >
        <Text level='p' className='paragraph'>
          Name: {name}
        </Text>
        <Text level='p' className='paragraph'>
          Cohort Name: {cohortName}
        </Text>
        {profession && (
          <Text level='p' className='paragraph'>
            Profession: {profession}
          </Text>
        )}
        {school && (
          <Text level='p' className='paragraph'>
            School: {school}
          </Text>
        )}
        {college && (
          <Text level='p' className='paragraph'>
            College: {college}
          </Text>
        )}
        {workExperience && (
          <Text level='p' className='paragraph'>
            Work Experience: {workExperience}
          </Text>
        )}
        <Text level='p' className='paragraph'>
          Created on: {formatDate(createdAt)}
        </Text>
        <Text level='p' className='paragraph'>
          Updated on: {formatDate(updatedAt)}
        </Text>
      </FlexContainer>
      <FlexContainer
        itemCenter={true}
        justifyCenter={false}
        wrap={false}
        className='justify-start gap-1'
      >
        <Text level='p' className='paragraph'>
          Status
        </Text>
        <div className='w-full'>
          <SelectInput
            list={programLeadStatusList}
            selectedItem={status}
            onChange={handleUpdateLeadStatus}
          />
        </div>
      </FlexContainer>
      <FlexContainer wrap={false} className='gap-1'>
        {contactNo && (
          <LinkButton
            buttonProps={{
              variant: 'GHOST',
              text: 'Call',
            }}
            href={`tel:${contactNo}`}
            className='w-full'
          />
        )}
        {contactNo && (
          <LinkButton
            buttonProps={{
              variant: 'GHOST',
              text: 'Whatsapp',
            }}
            target='BLANK'
            href={sendMessageToWhatsappURL(contactNo)}
            className='w-full'
          />
        )}
        {email && (
          <LinkButton
            buttonProps={{
              variant: 'GHOST',
              text: 'Email',
            }}
            href={`mailto:${email}`}
            className='w-full'
          />
        )}
      </FlexContainer>
    </FlexContainer>
  );
};

export default ProgramLeadsCard;
