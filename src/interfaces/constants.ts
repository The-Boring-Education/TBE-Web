import { UserTypeConfig } from '.';

export interface AdminDashboardCardProps {
  heading: string;
  subtitle: string;
  link: string;
}

export type AuthHOCConfigType = {
  admin: UserTypeConfig;
  adminLogin: UserTypeConfig;
};
