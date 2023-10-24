import {
  AddALeadRequestPayload,
  ChooseTechCohortActionType,
  ChooseTechCohortInitialFormDataType,
  UseBestTechProgramFormDataType,
} from '@/interfaces';
import { useReducer } from 'react';

const useBestTechCohortFormData = ({
  cohortName = '',
}: UseBestTechProgramFormDataType) => {
  const initialFormData: AddALeadRequestPayload = {
    name: '',
    contactNo: '',
    email: '',
    profession: '',
    cohortName,
    school: '',
    college: '',
    workExperience: '',
  };

  // Reducer function to manage form field data
  const chooseTechCohortFormReducer = (
    state: ChooseTechCohortInitialFormDataType,
    { type, field, value }: ChooseTechCohortActionType
  ) => {
    switch (type) {
      case 'UPDATE_FIELD':
        return { ...state, [field]: value };
      case 'RESET_FIELDS':
        return initialFormData;
      default:
        return state;
    }
  };

  const [formData, dispatch] = useReducer(
    chooseTechCohortFormReducer,
    initialFormData
  );

  return { formData, dispatch };
};

export default useBestTechCohortFormData;
