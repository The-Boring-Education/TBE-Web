declare module 'msw';
declare module 'msw/node';

declare type TestApiHandlerResponse = Response;

declare module 'next-test-api-route-handler' {
  export * from 'next-test-api-route-handler/dist/src';
  export type TestApiHandlerResponse = Response;
}

declare module 'next-test-api-route-handler/dist/src' {
  export * from 'next-test-api-route-handler/dist/src/index';
}