
import React, { useState } from 'react';

import { Button } from '../ui/button';
import DomainSection from './DomainSection';
import DSASection from './DSASection';
import LanguageSection from './LanguageSection';

const TabSection = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs = [
    { 
      id: 'domains', 
      label: 'Explore by Domain', 
      description: 'Choose your career path',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'languages', 
      label: 'Explore by Language', 
      description: 'Pick your coding language',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'dsa', 
      label: 'DSA Learning Path', 
      description: 'Master problem solving',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="px-4 py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select any option below to start your personalized tech journey
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12 max-w-4xl mx-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`flex-1 py-6 px-6 min-h-[80px] flex flex-col items-start justify-center transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 bg-white'
              }`}
            >
              <span className="font-bold text-base mb-1">{tab.label}</span>
              <span className="text-xs opacity-90">{tab.description}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content with smooth transitions */}
        <div className="min-h-[400px]">
          {activeTab === 'domains' && (
            <div className="animate-fade-in">
              <DomainSection />
            </div>
          )}
          {activeTab === 'languages' && (
            <div className="animate-fade-in">
              <LanguageSection />
            </div>
          )}
          {activeTab === 'dsa' && (
            <div className="animate-fade-in">
              <DSASection />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TabSection;
