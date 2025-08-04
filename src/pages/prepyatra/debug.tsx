import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getProxyUrls } from '@/utils/reverse-proxy';
import {
  getEnvironmentConfig,
  validateEnvironmentVariables,
} from '@/utils/env-validation';

interface DebugProps {
  environment: string;
  proxyUrls: {
    prepyatra: string;
    quiz: string;
    onboarding: string;
  };
  envConfig: {
    prepyatraUrl: string;
    quizUrl: string;
    onboardingUrl: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
  validation: {
    isValid: boolean;
    missingVars: string[];
    warnings: string[];
  };
  currentUrl: string;
  headers: Record<string, string>;
}

const DebugPage = ({
  environment,
  proxyUrls,
  envConfig,
  validation,
  currentUrl,
  headers,
}: DebugProps) => {
  const router = useRouter();

  const testUrls = [
    { name: 'PrepYatra', url: proxyUrls.prepyatra },
    { name: 'Quizzes', url: proxyUrls.quiz },
    { name: 'Onboarding', url: proxyUrls.onboarding },
  ];

  const testHealthCheck = async (serviceName: string) => {
    try {
      const response = await fetch(`/api/health/${serviceName.toLowerCase()}`);
      const data = await response.json();
      alert(
        `${serviceName} Health: ${data.status}\nResponse Time: ${data.responseTime}ms`
      );
    } catch (error) {
      alert(`${serviceName} Health Check Failed: ${error}`);
    }
  };

  return (
    <>
      <Head>
        <title>PrepYatra Debug - Reverse Proxy Diagnostics</title>
        <meta name='robots' content='noindex, nofollow' />
      </Head>

      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h1 className='text-3xl font-bold text-gray-900 mb-6'>
              🔧 PrepYatra Reverse Proxy Debug
            </h1>

            {/* Current Request Info */}
            <div className='mb-8 p-4 bg-blue-50 rounded-lg'>
              <h2 className='text-lg font-semibold text-blue-900 mb-2'>
                Current Request
              </h2>
              <p className='text-blue-800'>
                <strong>URL:</strong> {currentUrl}
              </p>
              <p className='text-blue-800'>
                <strong>Environment:</strong> {environment}
              </p>
              <p className='text-blue-800'>
                <strong>
                  This page should only show if reverse proxy failed!
                </strong>
              </p>
            </div>

            {/* Environment Configuration */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Environment Configuration
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    Environment
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Production: {envConfig.isProduction ? '✅' : '❌'}
                    <br />
                    Development: {envConfig.isDevelopment ? '✅' : '❌'}
                  </p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium text-gray-900 mb-2'>Validation</h3>
                  <p className='text-sm text-gray-600'>
                    Valid: {validation.isValid ? '✅' : '❌'}
                    <br />
                    Missing Vars: {validation.missingVars.length}
                    <br />
                    Warnings: {validation.warnings.length}
                  </p>
                </div>
              </div>
            </div>

            {/* URL Configuration */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Proxy URLs
              </h2>
              <div className='space-y-3'>
                {testUrls.map((service) => (
                  <div key={service.name} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {service.name}
                        </h3>
                        <p className='text-sm text-gray-600 break-all'>
                          {service.url}
                        </p>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => window.open(service.url, '_blank')}
                          className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
                        >
                          Test URL
                        </button>
                        <button
                          onClick={() => testHealthCheck(service.name)}
                          className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
                        >
                          Health Check
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Issues */}
            {(!validation.isValid || validation.warnings.length > 0) && (
              <div className='mb-8'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Issues Found
                </h2>

                {validation.missingVars.length > 0 && (
                  <div className='p-4 bg-red-50 rounded-lg mb-4'>
                    <h3 className='font-medium text-red-900 mb-2'>
                      Missing Environment Variables:
                    </h3>
                    <ul className='text-sm text-red-800 space-y-1'>
                      {validation.missingVars.map((varName) => (
                        <li key={varName}>• {varName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className='p-4 bg-yellow-50 rounded-lg'>
                    <h3 className='font-medium text-yellow-900 mb-2'>
                      Warnings:
                    </h3>
                    <ul className='text-sm text-yellow-800 space-y-1'>
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Request Headers */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Request Headers
              </h2>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <pre className='text-sm text-gray-600 whitespace-pre-wrap'>
                  {JSON.stringify(headers, null, 2)}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Quick Actions
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <button
                  onClick={() => (window.location.href = '/api/env-check')}
                  className='p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Environment Check API
                </button>

                <button
                  onClick={() => (window.location.href = '/api/health')}
                  className='p-3 bg-green-600 text-white rounded-lg hover:bg-green-700'
                >
                  Overall Health Check
                </button>

                <button
                  onClick={() => router.push('/')}
                  className='p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
                >
                  Back to Home
                </button>
              </div>

              <div className='p-4 bg-yellow-50 rounded-lg'>
                <h3 className='font-medium text-yellow-900 mb-2'>
                  Expected Behavior:
                </h3>
                <ul className='text-sm text-yellow-800 space-y-1'>
                  <li>
                    • Vercel should rewrite /prepyatra to the actual PrepYatra
                    app
                  </li>
                  <li>
                    • This debug page should NOT be visible in normal operation
                  </li>
                  <li>
                    • If you see this page, the reverse proxy is not working
                  </li>
                  <li>• Check environment variables in Vercel dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // Get current URL
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const currentUrl = `${protocol}://${host}${req.url}`;

  // Get configuration
  const proxyUrls = getProxyUrls();
  const envConfig = getEnvironmentConfig();
  const validation = validateEnvironmentVariables();

  // Get relevant headers
  const headers = {
    host: req.headers.host || '',
    'user-agent': req.headers['user-agent'] || '',
    'x-forwarded-for': req.headers['x-forwarded-for'] || '',
    'x-forwarded-proto': req.headers['x-forwarded-proto'] || '',
    'x-vercel-deployment-url': req.headers['x-vercel-deployment-url'] || '',
  };

  return {
    props: {
      environment: process.env.NODE_ENV || 'unknown',
      proxyUrls,
      envConfig,
      validation,
      currentUrl,
      headers,
    },
  };
};

export default DebugPage;
