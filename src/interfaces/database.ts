import { CohortLeadStatus } from './global';
import { AddALeadRequestPayload, AddAnAdminRequestPayload } from './api';

export interface CohortLeadDocumentModel extends AddALeadRequestPayload {
  status?: CohortLeadStatus;
}

export interface AdminUserDocumentModel extends AddAnAdminRequestPayload {
  name: string;
  email: string;
  googleId: string;
}
