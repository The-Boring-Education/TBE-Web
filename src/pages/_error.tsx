import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const CustomErrorComponent = (props: ErrorProps) => (
  <Error statusCode={props.statusCode || 500} />
);

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
