import React, { useState } from "react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const LanguageSection = () => {
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  const scrollToDomainSection = (domainId: string) => {
    // Close current expanded language
    setExpandedLanguage(null);

    // Wait for animation to complete, then scroll
    setTimeout(() => {
      const element = document.getElementById("domains");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

  const languages = [
    {
      id: "javascript",
      name: "JavaScript",
      beginnerFriendly: true,
      companyTypes: ["Startups", "Product Companies", "E-commerce", "Agencies"],
      timeToLearn: "3-5 Months",
      salaryRange: "₹3-15 LPA",
      domains: [
        { name: "Frontend Development", id: "frontend" },
        { name: "Backend Development", id: "backend" },
        { name: "Mobile Development", id: "mobile" },
        { name: "Web3 Development", id: "web3" },
      ],
      description:
        "The language of the web - powers both frontend and backend development",
      gradient: "from-yellow-500 to-orange-500",
      jobOpportunities: "Excellent - Highest demand in web development",
    },
    {
      id: "python",
      name: "Python",
      beginnerFriendly: true,
      companyTypes: ["Tech Giants", "Startups", "Research Labs", "Finance"],
      timeToLearn: "4-6 Months",
      salaryRange: "₹4-20 LPA",
      domains: [
        { name: "Backend Development", id: "backend" },
        { name: "Data Science", id: "datascience" },
        { name: "DevOps Engineering", id: "devops" },
        { name: "Cybersecurity", id: "security" },
      ],
      description: "Versatile language perfect for beginners and experts alike",
      gradient: "from-blue-500 to-green-500",
      jobOpportunities: "Outstanding - Growing demand in AI/ML and backend",
    },
    {
      id: "java",
      name: "Java",
      beginnerFriendly: true,
      companyTypes: ["Enterprises", "Banks", "MNCs", "Government"],
      timeToLearn: "4-7 Months",
      salaryRange: "₹4-18 LPA",
      domains: [
        { name: "Backend Development", id: "backend" },
        { name: "Mobile Development", id: "mobile" },
        { name: "Enterprise Software", id: "enterprise" },
        { name: "Big Data", id: "bigdata" },
      ],
      description: "Enterprise-grade language with strong job market demand",
      gradient: "from-red-500 to-orange-500",
      jobOpportunities:
        "Stable - High demand in enterprise and banking sectors",
    },
    {
      id: "cpp",
      name: "C++",
      beginnerFriendly: false,
      companyTypes: [
        "Gaming Studios",
        "System Companies",
        "Finance",
        "Automotive",
      ],
      timeToLearn: "6-9 Months",
      salaryRange: "₹5-22 LPA",
      domains: [
        { name: "Game Development", id: "gamedev" },
        { name: "System Programming", id: "systems" },
        { name: "Competitive Programming", id: "competitive" },
        { name: "Embedded Systems", id: "embedded" },
      ],
      description: "High-performance language for system-level programming",
      gradient: "from-purple-500 to-blue-500",
      jobOpportunities: "Specialized - High paying but niche roles",
    },
    {
      id: "golang",
      name: "Go",
      beginnerFriendly: false,
      companyTypes: [
        "Cloud Companies",
        "Startups",
        "DevOps Teams",
        "Microservices",
      ],
      timeToLearn: "5-7 Months",
      salaryRange: "₹6-25 LPA",
      domains: [
        { name: "Backend Development", id: "backend" },
        { name: "DevOps Engineering", id: "devops" },
        { name: "Cloud Computing", id: "cloud" },
        { name: "Microservices", id: "microservices" },
      ],
      description: "Modern language designed for scalable backend systems",
      gradient: "from-cyan-500 to-blue-500",
      jobOpportunities: "Growing - High demand in cloud and DevOps roles",
    },
    {
      id: "typescript",
      name: "TypeScript",
      beginnerFriendly: true,
      companyTypes: [
        "Startups",
        "Product Companies",
        "Enterprises",
        "Agencies",
      ],
      timeToLearn: "2-4 Months",
      salaryRange: "₹4-16 LPA",
      domains: [
        { name: "Frontend Development", id: "frontend" },
        { name: "Backend Development", id: "backend" },
        { name: "Full Stack Development", id: "fullstack" },
        { name: "Mobile Development", id: "mobile" },
      ],
      description: "JavaScript with types - safer and more maintainable code",
      gradient: "from-blue-600 to-purple-600",
      jobOpportunities: "Excellent - Increasingly preferred over JavaScript",
    },
    {
      id: "rust",
      name: "Rust",
      beginnerFriendly: false,
      companyTypes: ["System Companies", "Blockchain", "Gaming", "Mozilla"],
      timeToLearn: "6-10 Months",
      salaryRange: "₹8-30 LPA",
      domains: [
        { name: "System Programming", id: "systems" },
        { name: "Web3 Development", id: "web3" },
        { name: "Game Development", id: "gamedev" },
        { name: "Backend Development", id: "backend" },
      ],
      description:
        "Memory-safe systems programming with zero-cost abstractions",
      gradient: "from-orange-600 to-red-600",
      jobOpportunities: "Emerging - High paying but limited positions",
    },
    {
      id: "swift",
      name: "Swift",
      beginnerFriendly: true,
      companyTypes: ["Apple", "iOS Agencies", "Startups", "Product Companies"],
      timeToLearn: "4-6 Months",
      salaryRange: "₹5-20 LPA",
      domains: [
        { name: "iOS Development", id: "ios" },
        { name: "Mobile Development", id: "mobile" },
        { name: "macOS Development", id: "macos" },
        { name: "watchOS Development", id: "watchos" },
      ],
      description: "Apple's modern language for iOS and macOS development",
      gradient: "from-gray-600 to-blue-600",
      jobOpportunities: "Good - Stable demand for iOS development",
    },
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
          Explore by Language
        </h3>
        <p className="text-gray-600 text-lg">
          Learning timeline based on{" "}
          <span className="font-semibold text-purple-600">
            2-3 hours of daily practice
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => (
          <Card
            key={language.id}
            className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-0 shadow-lg ${
              expandedLanguage === language.id
                ? "ring-2 ring-pink-400 shadow-2xl scale-[1.02]"
                : ""
            }`}
            onClick={() =>
              setExpandedLanguage(
                expandedLanguage === language.id ? null : language.id,
              )
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-lg font-bold bg-gradient-to-r ${language.gradient} bg-clip-text text-transparent`}
              >
                {language.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {language.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Beginner Friendly:
                  </span>
                  <Badge
                    variant={
                      language.beginnerFriendly ? "default" : "secondary"
                    }
                    className="font-medium"
                  >
                    {language.beginnerFriendly ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time to Learn:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {language.timeToLearn}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Salary Range:</span>
                  <span className="text-sm font-bold text-green-600">
                    {language.salaryRange}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm font-semibold text-gray-800 mb-2 block">
                  Click on Domain to learn more:
                </span>
                <div className="flex flex-wrap gap-2">
                  {language.domains.map((domain) => (
                    <Badge
                      key={domain.id}
                      variant="outline"
                      className="text-xs font-medium cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 px-3 py-1"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        scrollToDomainSection(domain.id);
                      }}
                    >
                      {domain.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {expandedLanguage === language.id && (
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-2" />
                      Company Types:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {language.companyTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2" />
                      Job Opportunities:
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                      {language.jobOpportunities}
                    </p>
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

export default LanguageSection;
