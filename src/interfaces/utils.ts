import { NextPageContext } from 'next';

export interface GetPreFetchProps extends NextPageContext {
  query: {
    workshop?: string;
    microCamp?: string;
  };
  pathname: string;
  resolvedUrl: string;
}
