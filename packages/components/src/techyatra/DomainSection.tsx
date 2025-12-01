import { ExternalLink } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const DomainSection = () => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const domains = [
    {
      id: 'frontend',
      name: 'Frontend Development',
      beginnerFriendly: true,
      jobDemand: 'High',
      salaryRange: '₹3-8 LPA',
      timeToLearn: '4-6 Months',
      remoteFriendly: true,
      companyTypes: ['Startups', 'Product Companies', 'Service Companies'],
      languages: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Angular'],
      howToLearn: [
        'Start with HTML, CSS, and JavaScript fundamentals',
        'Build responsive websites and interactive UIs',
        'Master modern frameworks like React or Vue',
        'Learn state management and API integration'
      ],
      whereToLearn: [
        'Zero to One Frontend Dev - The Boring Education',
        'Basics of Programming with JS - The Boring Education',
        'Use ChatGPT for specific concept explanations',
        'MDN Web Docs for references'
      ],
      courseLinks: [
        {
          name: 'Zero to One Frontend Dev',
          url: 'https://www.theboringeducation.com/shiksha/zero-to-one-frontend-development?courseId=677642add16888110ba779ad'
        },
        {
          name: 'Basics of Programming with JS',
          url: 'https://www.theboringeducation.com/shiksha/basics-of-programming-with-js?courseId=66b99909946f754d9d7a4c50'
        }
      ]
    },
    {
      id: 'backend',
      name: 'Backend Development',
      beginnerFriendly: true,
      jobDemand: 'High',
      salaryRange: '₹4-10 LPA',
      timeToLearn: '5-7 Months',
      remoteFriendly: true,
      companyTypes: ['All Companies', 'Tech Giants', 'Fintech'],
      languages: ['Node.js', 'Python', 'Java', 'Go', 'C#'],
      howToLearn: [
        'Learn server-side programming fundamentals',
        'Understand databases and API design',
        'Master cloud services and deployment',
        'Practice system design concepts'
      ],
      whereToLearn: [
        'Zero to One Backend Dev - The Boring Education',
        'Logic Building For Everyone - The Boring Education',
        'Use ChatGPT for system design concepts',
        'AWS/Azure Documentation for cloud services'
      ],
      courseLinks: [
        {
          name: 'Zero to One Backend Dev',
          url: 'https://www.theboringeducation.com/shiksha/zero-to-one-backend-development?courseId=6799dfcadd77f0ff4c605790'
        },
        {
          name: 'Logic Building For Everyone',
          url: 'https://www.theboringeducation.com/shiksha/logic-building-for-everyone?courseId=669f374b2ef89c28d87b4473'
        }
      ]
    },
    {
      id: 'datascience',
      name: 'Data Science',
      beginnerFriendly: false,
      jobDemand: 'High',
      salaryRange: '₹6-25 LPA',
      timeToLearn: '8-12 Months',
      remoteFriendly: true,
      companyTypes: ['MNCs', 'Tech Giants', 'Analytics Companies', 'Research Labs'],
      languages: ['Python', 'R', 'SQL', 'Scala', 'Julia', 'MATLAB'],
      gradient: 'from-green-500 to-emerald-500',
      howToLearn: [
        'Master statistics and mathematics foundations',
        'Learn data manipulation and visualization',
        'Build ML models and analyze real datasets',
        'Practice with real-world projects'
      ],
      whereToLearn: [
        'YouTube: "Data Science by Krish Naik"',
        'Kaggle Learn Courses',
        'Coursera Data Science Specializations',
        'Fast.ai Practical Deep Learning'
      ]
    },
    {
      id: 'devops',
      name: 'DevOps Engineering',
      beginnerFriendly: false,
      jobDemand: 'Very High',
      salaryRange: '₹6-20 LPA',
      timeToLearn: '6-10 Months',
      remoteFriendly: true,
      companyTypes: ['All Companies', 'Cloud Companies', 'Enterprises', 'Startups'],
      languages: ['Python', 'Bash', 'Go', 'YAML', 'PowerShell', 'Terraform'],
      gradient: 'from-orange-500 to-red-500',
      howToLearn: [
        'Understand Linux systems and networking',
        'Learn containerization and orchestration',
        'Master CI/CD pipelines and cloud platforms',
        'Practice infrastructure as code'
      ],
      whereToLearn: [
        'YouTube: "DevOps by Abhishek Veeramalla"',
        'KodeKloud DevOps Learning Path',
        'AWS/Azure Cloud Documentation',
        'Docker and Kubernetes Official Docs'
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile Development',
      beginnerFriendly: true,
      jobDemand: 'High',
      salaryRange: '₹4-16 LPA',
      timeToLearn: '5-8 Months',
      remoteFriendly: true,
      companyTypes: ['Startups', 'Product Companies', 'Gaming Companies', 'E-commerce'],
      languages: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Dart'],
      gradient: 'from-indigo-500 to-purple-500',
      howToLearn: [
        'Choose between native or cross-platform development',
        'Build user-friendly mobile interfaces',
        'Learn app store optimization and deployment',
        'Understand mobile-specific patterns'
      ],
      whereToLearn: [
        'YouTube: "Flutter by Reso Coder"',
        'React Native Documentation',
        'Udemy Mobile Development Courses',
        'Official iOS/Android Developer Guides'
      ]
    },
    {
      id: 'web3',
      name: 'Web3 & Blockchain',
      beginnerFriendly: false,
      jobDemand: 'Average',
      salaryRange: '₹8-30 LPA',
      timeToLearn: '8-15 Months',
      remoteFriendly: true,
      companyTypes: ['Startups', 'Crypto Companies', 'DeFi Protocols', 'NFT Platforms'],
      languages: ['Solidity', 'JavaScript', 'Rust', 'Python', 'Go', 'Web3.js'],
      gradient: 'from-yellow-500 to-orange-500',
      howToLearn: [
        'Understand blockchain fundamentals and cryptography',
        'Learn smart contract development',
        'Build DApps and understand DeFi protocols',
        'Practice with testnets and real deployments'
      ],
      whereToLearn: [
        'YouTube: "Blockchain by Dapp University"',
        'Ethereum.org Documentation',
        'Buildspace Web3 Projects',
        'Solidity Documentation'
      ]
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Explore by Domain
        </h3>
        <p className="text-gray-600 text-lg">
          Timeline based on <span className="font-semibold text-purple-600">2-3 hours of daily learning</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <Card 
            key={domain.id} 
            className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-white via-gray-50 to-purple-50 border-0 shadow-lg ${
              expandedDomain === domain.id ? 'ring-2 ring-purple-500 shadow-2xl scale-105' : ''
            }`}
            onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg text-black">
                {domain.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Beginner Friendly:</span>
                  <Badge variant={domain.beginnerFriendly ? "default" : "secondary"}>
                    {domain.beginnerFriendly ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Job Demand:</span>
                  <Badge variant={domain.jobDemand === 'High' ? "default" : "secondary"}>
                    {domain.jobDemand}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Salary Range:</span>
                  <span className="text-sm font-semibold text-black">{domain.salaryRange}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time to Learn:</span>
                  <span className="text-sm font-semibold text-black">{domain.timeToLearn}</span>
                </div>
              </div>

              {expandedDomain === domain.id && (
                <div className="mt-6 pt-4 border-t space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Remote Friendly:</h4>
                    <Badge variant={domain.remoteFriendly ? "default" : "secondary"} className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      {domain.remoteFriendly ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Company Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {domain.companyTypes.map((type) => (
                        <Badge key={type} variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {domain.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How to Learn:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {domain.howToLearn.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Recommended Learning Resources:</h4>
                    <div className="space-y-2">
                      {domain.courseLinks && domain.courseLinks.map((course, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(course.url, '_blank');
                          }}
                          className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-between group"
                        >
                          <span className="text-sm font-medium text-blue-700">{course.name}</span>
                          <ExternalLink size={14} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                      ))}
                      <div className="text-sm text-gray-600 space-y-1">
                        {domain.whereToLearn.slice(domain.courseLinks?.length || 0).map((resource, index) => (
                          <div key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                            {resource}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DomainSection;
