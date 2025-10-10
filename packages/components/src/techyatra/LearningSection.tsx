
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';

const LearningSection = () => {
  const courses = [
    {
      id: 'logic-building',
      title: 'Logic Building For Everyone',
      description: 'Master programming fundamentals and logical thinking',
      level: 'Beginner',
      duration: '4-6 weeks',
      gradient: 'from-blue-500 to-cyan-500',
      url: 'https://www.theboringeducation.com/shiksha/logic-building-for-everyone?courseId=669f374b2ef89c28d87b4473',
      topics: ['Problem Solving', 'Logic Development', 'Programming Basics']
    },
    {
      id: 'js-basics',
      title: 'Basics of Programming with JS',
      description: 'Learn JavaScript fundamentals from scratch',
      level: 'Beginner',
      duration: '6-8 weeks',
      gradient: 'from-yellow-500 to-orange-500',
      url: 'https://www.theboringeducation.com/shiksha/basics-of-programming-with-js?courseId=66b99909946f754d9d7a4c50',
      topics: ['JavaScript Syntax', 'Functions', 'Objects', 'DOM Manipulation']
    },
    {
      id: 'frontend-dev',
      title: 'Zero to One Frontend Dev',
      description: 'Complete frontend development from basics to advanced',
      level: 'Intermediate',
      duration: '10-12 weeks',
      gradient: 'from-purple-500 to-pink-500',
      url: 'https://www.theboringeducation.com/shiksha/zero-to-one-frontend-development?courseId=677642add16888110ba779ad',
      topics: ['HTML/CSS', 'React.js', 'State Management', 'Projects']
    },
    {
      id: 'backend-dev',
      title: 'Zero to One Backend Dev',
      description: 'Master backend development and server-side programming',
      level: 'Intermediate',
      duration: '10-12 weeks',
      gradient: 'from-green-500 to-emerald-500',
      url: 'https://www.theboringeducation.com/shiksha/zero-to-one-backend-development?courseId=6799dfcadd77f0ff4c605790',
      topics: ['Node.js', 'Databases', 'APIs', 'Authentication']
    }
  ];

  const interviewSheets = [
    {
      id: 'javascript',
      title: 'JavaScript Interview Questions',
      description: 'Comprehensive JavaScript interview preparation',
      questionCount: '100+',
      gradient: 'from-yellow-400 to-yellow-600',
      url: 'https://www.theboringeducation.com/interview-prep/javascript-interview-questions?sheetId=673333d146a1961fc8b84345',
      topics: ['ES6+', 'Closures', 'Promises', 'Event Loop']
    },
    {
      id: 'react',
      title: 'React.js Interview Questions',
      description: 'Master React interviews with detailed Q&A',
      questionCount: '80+',
      gradient: 'from-blue-400 to-blue-600',
      url: 'https://www.theboringeducation.com/interview-prep/react-interview-questions?sheetId=6733f45fb99d209c811f3f4e',
      topics: ['Hooks', 'State Management', 'Performance', 'Testing']
    },
    {
      id: 'nodejs',
      title: 'Node.js Interview Questions',
      description: 'Backend development interview preparation',
      questionCount: '90+',
      gradient: 'from-green-400 to-green-600',
      url: 'https://www.theboringeducation.com/interview-prep/node-interview-questions?sheetId=67345538bdf619907a005031',
      topics: ['Express.js', 'Middleware', 'Authentication', 'Performance']
    },
    {
      id: 'database',
      title: 'Database Interview Questions',
      description: 'SQL and NoSQL database concepts',
      questionCount: '70+',
      gradient: 'from-purple-400 to-purple-600',
      url: 'https://www.theboringeducation.com/interview-prep/db-interview-questions?sheetId=673427888dabf8ca6e3c7c4b',
      topics: ['SQL Queries', 'Normalization', 'Indexing', 'MongoDB']
    }
  ];

  return (
    <section className="px-4 py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Learn Tech for Free
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master programming and ace interviews with our comprehensive free courses and prep sheets
          </p>
        </div>

        {/* Courses Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 flex items-center justify-center gap-2">
              <BookOpen className="text-blue-600" size={32} />
              Free Courses
            </h3>
            <p className="text-gray-600">
              Structured learning paths with hands-on projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${course.gradient}`}></div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {course.duration}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">What you'll learn:</h5>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs bg-gray-50">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => window.open(course.url, '_blank')}
                    className={`w-full bg-gradient-to-r ${course.gradient} text-white hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  >
                    Start Learning
                    <ExternalLink className="ml-2" size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interview Prep Section */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center justify-center gap-2">
              <FileText className="text-green-600" size={32} />
              Interview Prep Sheets
            </h3>
            <p className="text-gray-600">
              Curated questions with detailed answers to ace your interviews
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {interviewSheets.map((sheet) => (
              <Card key={sheet.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sheet.gradient}`}></div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {sheet.questionCount} Questions
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {sheet.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{sheet.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Key Topics:</h5>
                    <div className="flex flex-wrap gap-2">
                      {sheet.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs bg-gray-50">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => window.open(sheet.url, '_blank')}
                    className={`w-full bg-gradient-to-r ${sheet.gradient} text-white hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  >
                    Access Questions
                    <ExternalLink className="ml-2" size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningSection;
