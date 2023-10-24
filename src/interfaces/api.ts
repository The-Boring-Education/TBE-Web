import { BestSuitedForType, CohortLeadStatus, CohortNameType } from '.';

export interface AddALeadRequestPayload {
  name: string;
  contactNo: string;
  email?: string;
  cohortName?: CohortNameType | '';
  profession?: BestSuitedForType | '';
  school?: string;
  college?: string;
  workExperience?: string;
}

export interface UpdateALeadRequestPayload extends AddALeadRequestPayload {
  id: string;
  status: CohortLeadStatus;
}

export type UpdateALeadByIDFromDBType = Omit<UpdateALeadRequestPayload, 'id'>;

export interface AddAnAdminRequestPayload {
  name: string;
  email: string;
}

export type ProgramLeadAPIResponse = UpdateALeadRequestPayload;

export type APIMethodTypes = 'GET' | 'POST' | 'PATCH';

export interface APIMakeRquestProps {
  method?: APIMethodTypes;
  url: string;
  headers?: { [key: string]: string };
  body?: any;
}

export interface ClientAPIResponseProps {
  status: boolean;
  data?: any;
}

export interface APIResponseProps extends ClientAPIResponseProps {
  message?: string;
  error?: any;
}

export interface ApiHookResultProps {
  data: any | undefined;
  isSuccess: boolean;
  loading: boolean;
  error: any;
  makeRequest: (params: APIMakeRquestProps) => Promise<void>;
}

export interface ClientAPIResponse {
  status: boolean;
  data?: any;
}

export interface APIResponseType extends ClientAPIResponse {
  message?: string;
  error?: string;
}

export type DatabaseQueryResponseType = {
  data?: any;
  error?: any;
};
