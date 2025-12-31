import React from 'react';
import { FlexContainer, Pill, Text, LoadingSpinner } from '@tbe/components';
import type { UnskilledTrendData } from '@tbe/interface';
import PeriodTrendChart from './PeriodTrendChart';

interface TrendDataPanelProps {
  data: UnskilledTrendData | null;
  loading: boolean;
  error: string | null;
  currentMetricType: string | null;
}

const TrendDataPanel: React.FC<TrendDataPanelProps> = ({
  data,
  loading,
  error,
  currentMetricType,
}) => {
  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <FlexContainer className="py-8" direction="col" itemCenter>
          <LoadingSpinner height={8} width={8} />
          <Text className="text-gray-500 mt-4" level="p">
            Loading trend data...
          </Text>
        </FlexContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-red-200">
        <Text className="text-red-600" level="p">
          Error loading trend data: {error}
        </Text>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Determine which metrics to show based on current tab
  const shouldShowLocations = currentMetricType !== 'location';
  const shouldShowDomains = currentMetricType !== 'domain';
  const shouldShowCompanyTypes = currentMetricType !== 'company_type';
  // Always show experience levels

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <FlexContainer className="gap-6" direction="col">
        {/* Header */}
        <FlexContainer className="gap-2" direction="col">
          <Text className="heading-5" level="h5">
            Trend Insights for{' '}
            <span className="text-primary">{data.metric_name}</span>
          </Text>
          <Text className="pre-title text-gray-500" level="p">
            Generated at: {new Date(data.generated_at).toLocaleString()}
          </Text>
        </FlexContainer>

        {/* Period Trend Chart */}
        <div className="border-t border-gray-200 pt-4">
          <Text className="heading-6 mb-3" level="h6">
            Job Count Trends
          </Text>
          <PeriodTrendChart periods={data.periods} />
        </div>

        {/* Metric Pills */}
        <div className="border-t border-gray-200 pt-4">
          <FlexContainer className="gap-6" direction="col">
            {/* Top Locations */}
            {shouldShowLocations && data.topLocations.length > 0 && (
              <div>
                <Text className="heading-6 mb-3" level="h6">
                  Top Locations
                </Text>
                <FlexContainer wrap className="gap-2">
                  {data.topLocations.map((location, index) => (
                    <Pill
                      key={index}
                      text={location}
                      variant="PRIMARY"
                      containerClasses="text-sm"
                    />
                  ))}
                </FlexContainer>
              </div>
            )}

            {/* Job Domains */}
            {shouldShowDomains && data.jobDomains.length > 0 && (
              <div>
                <Text className="heading-6 mb-3" level="h6">
                  Job Domains
                </Text>
                <FlexContainer wrap className="gap-2">
                  {data.jobDomains.map((domain, index) => (
                    <Pill
                      key={index}
                      text={domain}
                      variant="PRIMARY"
                      containerClasses="text-sm"
                    />
                  ))}
                </FlexContainer>
              </div>
            )}

            {/* Company Types */}
            {shouldShowCompanyTypes && data.companyTypes.length > 0 && (
              <div>
                <Text className="heading-6 mb-3" level="h6">
                  Company Types
                </Text>
                <FlexContainer wrap className="gap-2">
                  {data.companyTypes.map((type, index) => (
                    <Pill
                      key={index}
                      text={type}
                      variant="PRIMARY"
                      containerClasses="text-sm"
                    />
                  ))}
                </FlexContainer>
              </div>
            )}

            {/* Experience Levels - Always show */}
            {data.experienceLevels.length > 0 && (
              <div>
                <Text className="heading-6 mb-3" level="h6">
                  Experience Levels
                </Text>
                <FlexContainer wrap className="gap-2">
                  {data.experienceLevels.map((level, index) => (
                    <Pill
                      key={index}
                      text={level}
                      variant="PRIMARY"
                      containerClasses="text-sm"
                    />
                  ))}
                </FlexContainer>
              </div>
            )}
          </FlexContainer>
        </div>
      </FlexContainer>
    </div>
  );
};

export default TrendDataPanel;
