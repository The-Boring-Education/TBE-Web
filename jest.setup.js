import { Response, Request, Headers } from 'node-fetch';
global.Response = Response;
global.Request = Request;
global.Headers = Headers;

import '@testing-library/jest-dom/extend-expect';
import { beforeAll, afterEach, afterAll } from '@jest/globals';
import { server } from './tests/msw/server';

// Allow router mocks.
// eslint-disable-next-line no-undef
jest.mock('next/router', () => require('next-router-mock'));

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
