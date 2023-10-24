import { AuthUserType, CohortNameType } from '.';

export interface UseUserProps {
  userType?: AuthUserType;
}

export interface UseBestTechProgramFormDataType {
  cohortName?: CohortNameType | '';
}
