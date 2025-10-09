
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const DSASection = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showPreparation, setShowPreparation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const goals = [
    {
      id: 'faang',
      name: 'FAANG/Top Tech',
      description: 'Google, Meta, Amazon, Apple, Netflix',
      gradient: 'from-red-500 to-pink-500',
      duration: '6-12 Months',
      difficulty: 'Hard'
    },
    {
      id: 'mnc',
      name: 'MNCs',
      description: 'Microsoft, Oracle, Adobe, SAP',
      gradient: 'from-blue-500 to-cyan-500',
      duration: '4-8 Months',
      difficulty: 'Medium-Hard'
    },
    {
      id: 'startup',
      name: 'Startups',
      description: 'Fast-growing companies, Product-based',
      gradient: 'from-green-500 to-emerald-500',
      duration: '3-6 Months',
      difficulty: 'Medium'
    }
  ];

  const preparationSteps = [
    {
      step: 1,
      title: 'Master the Fundamentals',
      description: 'Start with basic programming concepts and time/space complexity',
      duration: 'Week 1-2',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      step: 2,
      title: 'Learn Data Structures',
      description: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Tables',
      duration: 'Week 3-6',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      step: 3,
      title: 'Study Algorithms',
      description: 'Sorting, Searching, Recursion, Dynamic Programming, Greedy',
      duration: 'Week 7-10',
      gradient: 'from-pink-500 to-red-500'
    },
    {
      step: 4,
      title: 'Practice Patterns',
      description: 'Two Pointers, Sliding Window, Fast/Slow Pointers, BFS/DFS',
      duration: 'Week 11-14',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      step: 5,
      title: 'Solve Problems Daily',
      description: 'Start with Easy, move to Medium, then Hard problems',
      duration: 'Ongoing',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      step: 6,
      title: 'Mock Interviews',
      description: 'Practice with peers, use platforms like Pramp, InterviewBit',
      duration: 'Final Month',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const topicsByGoal = {
    faang: [
      {
        id: 'arrays',
        name: 'Arrays & Strings',
        type: 'Data Structure',
        description: 'Foundation of programming',
        questions: [
          { name: 'Two Sum', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Valid Parentheses', level: 'Easy', pattern: 'Stack' },
          { name: 'Longest Substring Without Repeating', level: 'Medium', pattern: 'Sliding Window' },
          { name: 'Group Anagrams', level: 'Medium', pattern: 'Hash Map' },
          { name: 'Minimum Window Substring', level: 'Hard', pattern: 'Sliding Window' }
        ]
      },
      {
        id: 'trees',
        name: 'Binary Trees',
        type: 'Data Structure',
        description: 'Hierarchical data organization',
        questions: [
          { name: 'Maximum Depth of Binary Tree', level: 'Easy', pattern: 'DFS' },
          { name: 'Same Tree', level: 'Easy', pattern: 'DFS' },
          { name: 'Binary Tree Level Order Traversal', level: 'Medium', pattern: 'BFS' },
          { name: 'Validate Binary Search Tree', level: 'Medium', pattern: 'DFS' },
          { name: 'Serialize and Deserialize Binary Tree', level: 'Hard', pattern: 'DFS/BFS' }
        ]
      },
      {
        id: 'dynamic-programming',
        name: 'Dynamic Programming',
        type: 'Algorithm',
        description: 'Optimization technique',
        questions: [
          { name: 'Climbing Stairs', level: 'Easy', pattern: 'DP' },
          { name: 'House Robber', level: 'Medium', pattern: 'DP' },
          { name: 'Coin Change', level: 'Medium', pattern: 'DP' },
          { name: 'Longest Increasing Subsequence', level: 'Medium', pattern: 'DP' },
          { name: 'Edit Distance', level: 'Hard', pattern: 'DP' }
        ]
      },
      {
        id: 'two-pointers',
        name: 'Two Pointers',
        type: 'Pattern',
        description: 'Efficient array traversal',
        questions: [
          { name: 'Valid Palindrome', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'Container With Most Water', level: 'Medium', pattern: 'Two Pointers' },
          { name: '3Sum', level: 'Medium', pattern: 'Two Pointers' },
          { name: 'Remove Duplicates from Sorted Array', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'Trapping Rain Water', level: 'Hard', pattern: 'Two Pointers' }
        ]
      },
      {
        id: 'graphs',
        name: 'Graph Algorithms',
        type: 'Algorithm',
        description: 'Network and relationship problems',
        questions: [
          { name: 'Number of Islands', level: 'Medium', pattern: 'DFS/BFS' },
          { name: 'Clone Graph', level: 'Medium', pattern: 'DFS/BFS' },
          { name: 'Course Schedule', level: 'Medium', pattern: 'Topological Sort' },
          { name: 'Word Ladder', level: 'Hard', pattern: 'BFS' },
          { name: 'Alien Dictionary', level: 'Hard', pattern: 'Topological Sort' }
        ]
      }
    ],
    mnc: [
      {
        id: 'arrays',
        name: 'Arrays & Basic Operations',
        type: 'Data Structure',
        description: 'Core programming foundation',
        questions: [
          { name: 'Two Sum', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Best Time to Buy and Sell Stock', level: 'Easy', pattern: 'Array' },
          { name: 'Contains Duplicate', level: 'Easy', pattern: 'Hash Set' },
          { name: 'Maximum Subarray', level: 'Easy', pattern: 'Kadane\'s Algorithm' },
          { name: 'Rotate Array', level: 'Medium', pattern: 'Array Manipulation' }
        ]
      },
      {
        id: 'strings',
        name: 'String Manipulation',
        type: 'Data Structure',
        description: 'Text processing fundamentals',
        questions: [
          { name: 'Valid Anagram', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Reverse String', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'First Unique Character', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Longest Common Prefix', level: 'Easy', pattern: 'String' },
          { name: 'Group Anagrams', level: 'Medium', pattern: 'Hash Map' }
        ]
      },
      {
        id: 'basic-dp',
        name: 'Basic Dynamic Programming',
        type: 'Algorithm',
        description: 'Introduction to optimization',
        questions: [
          { name: 'Fibonacci Number', level: 'Easy', pattern: 'DP' },
          { name: 'Climbing Stairs', level: 'Easy', pattern: 'DP' },
          { name: 'Min Cost Climbing Stairs', level: 'Easy', pattern: 'DP' },
          { name: 'House Robber', level: 'Medium', pattern: 'DP' },
          { name: 'Coin Change', level: 'Medium', pattern: 'DP' }
        ]
      },
      {
        id: 'searching',
        name: 'Binary Search',
        type: 'Algorithm',
        description: 'Efficient searching technique',
        questions: [
          { name: 'Binary Search', level: 'Easy', pattern: 'Binary Search' },
          { name: 'First Bad Version', level: 'Easy', pattern: 'Binary Search' },
          { name: 'Search Insert Position', level: 'Easy', pattern: 'Binary Search' },
          { name: 'Find Peak Element', level: 'Medium', pattern: 'Binary Search' },
          { name: 'Search in Rotated Sorted Array', level: 'Medium', pattern: 'Binary Search' }
        ]
      }
    ],
    startup: [
      {
        id: 'arrays',
        name: 'Basic Arrays',
        type: 'Data Structure', 
        description: 'Starting point for programming',
        questions: [
          { name: 'Two Sum', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Contains Duplicate', level: 'Easy', pattern: 'Hash Set' },
          { name: 'Best Time to Buy and Sell Stock', level: 'Easy', pattern: 'Array' },
          { name: 'Maximum Subarray', level: 'Easy', pattern: 'Kadane\'s Algorithm' },
          { name: 'Plus One', level: 'Easy', pattern: 'Array' }
        ]
      },
      {
        id: 'strings',
        name: 'String Basics',
        type: 'Data Structure',
        description: 'Text handling essentials',
        questions: [
          { name: 'Valid Palindrome', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'Valid Anagram', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Reverse String', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'First Unique Character', level: 'Easy', pattern: 'Hash Map' },
          { name: 'Implement strStr()', level: 'Easy', pattern: 'String' }
        ]
      },
      {
        id: 'linked-lists',
        name: 'Linked Lists',
        type: 'Data Structure',
        description: 'Dynamic data structure',
        questions: [
          { name: 'Reverse Linked List', level: 'Easy', pattern: 'Linked List' },
          { name: 'Merge Two Sorted Lists', level: 'Easy', pattern: 'Linked List' },
          { name: 'Linked List Cycle', level: 'Easy', pattern: 'Two Pointers' },
          { name: 'Remove Nth Node From End', level: 'Medium', pattern: 'Two Pointers' },
          { name: 'Add Two Numbers', level: 'Medium', pattern: 'Linked List' }
        ]
      }
    ]
  };

  const getFilteredQuestions = () => {
    if (!selectedGoal || !selectedTopic) return [];
    
    const goalTopics = topicsByGoal[selectedGoal as keyof typeof topicsByGoal];
    const topic = goalTopics?.find(t => t.id === selectedTopic);
    return topic?.questions || [];
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          DSA Learning Path
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          Structured learning with <span className="font-semibold text-green-600">1 hour daily practice</span> and <span className="font-semibold text-blue-600">1-2 problem solving</span>
        </p>

        {/* Goal Selection */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">What's your target?</h4>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {goals.map((goal) => (
              <Button
                key={goal.id}
                onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                className={`px-6 py-4 h-auto flex-col transition-all duration-300 ${
                  selectedGoal === goal.id
                    ? `bg-gradient-to-r ${goal.gradient} text-white shadow-xl scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-md'
                }`}
              >
                <span className="font-bold text-lg">{goal.name}</span>
                <span className="text-sm opacity-90">{goal.description}</span>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className={selectedGoal === goal.id ? "border-white text-white" : ""}>
                    {goal.duration}
                  </Badge>
                  <Badge variant="outline" className={selectedGoal === goal.id ? "border-white text-white" : ""}>
                    {goal.difficulty}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* How to Prepare Section */}
        <div className="mb-8">
          <Button
            onClick={() => setShowPreparation(!showPreparation)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 px-6 py-3"
          >
            {showPreparation ? 'Hide' : 'Show'} How to Prepare for DSA
          </Button>
        </div>
      </div>

      {/* Preparation Steps */}
      {showPreparation && (
        <div className="mb-12 animate-fade-in">
          <h4 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Step-by-Step DSA Preparation Guide
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preparationSteps.map((step, index) => (
              <Card key={step.step} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`}></div>
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm mr-3`}>
                      {step.step}
                    </div>
                    <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Goal-specific Topics */}
      {selectedGoal && (
        <div className="animate-fade-in">
          <h4 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {goals.find(g => g.id === selectedGoal)?.name} Preparation Roadmap
          </h4>
          
          <div className="space-y-8">
            {/* Combined Topics Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Complete Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-800 mb-3">Topics to Cover (Click to see questions):</h5>
                  <div className="flex flex-wrap gap-3">
                    {topicsByGoal[selectedGoal as keyof typeof topicsByGoal]?.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                        className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                          selectedTopic === topic.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                            : 'bg-white border-blue-200 text-gray-700 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <div className="text-sm font-medium">{topic.name}</div>
                        <div className="text-xs opacity-80">{topic.type}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedTopic && (
                  <div className="animate-fade-in">
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Practice Questions for {topicsByGoal[selectedGoal as keyof typeof topicsByGoal]?.find(t => t.id === selectedTopic)?.name}:
                    </h5>
                    <div className="space-y-2">
                      {getFilteredQuestions().map((question, qIndex) => (
                        <div key={qIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <span className="font-medium text-gray-800">{question.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {question.pattern}
                            </Badge>
                          </div>
                          <Badge 
                            variant={question.level === 'Easy' ? 'default' : question.level === 'Medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {question.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Understanding DSA Concepts */}
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🤔 New to DSA? Understanding the Basics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-blue-600 mb-2">Data Structures</h4>
                    <p className="text-gray-600">
                      Ways to organize and store data (Arrays, Trees, Graphs, etc.). Think of them as containers with specific rules.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-green-600 mb-2">Algorithms</h4>
                    <p className="text-gray-600">
                      Step-by-step procedures to solve problems (Sorting, Searching, Dynamic Programming, etc.).
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-purple-600 mb-2">Patterns</h4>
                    <p className="text-gray-600">
                      Common problem-solving techniques (Two Pointers, Sliding Window, etc.) that work across multiple problems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Prep Section */}
            <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  📚 How to Prep for {goals.find(g => g.id === selectedGoal)?.name}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Step 1: Pick a Topic</h4>
                    <p className="text-gray-600 text-sm">
                      Choose one topic from above (e.g., Arrays). Don't jump around - master one before moving to the next.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Step 2: Understand the Basics</h4>
                    <p className="text-gray-600 text-sm">
                      Ask ChatGPT: "Explain [topic] with examples and when to use it." Read until you understand the concept clearly.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Step 3: Practice Problems</h4>
                    <p className="text-gray-600 text-sm">
                      Start with Easy problems from the topic. Use LeetCode/HackerRank. If stuck, ask ChatGPT for hints, not solutions.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Step 4: Learn Patterns</h4>
                    <p className="text-gray-600 text-sm">
                      Identify common patterns in problems. Ask ChatGPT: "What are common patterns for [topic] problems?"
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-semibold text-gray-800 mb-2">Step 5: Review & Repeat</h4>
                    <p className="text-gray-600 text-sm">
                      Solve 3-5 problems daily. Review previous problems weekly. Move to next topic only after mastering current one.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-2"></span>
                  💡 Success Tips for {goals.find(g => g.id === selectedGoal)?.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Daily Practice:</h4>
                    <ul className="space-y-1">
                      <li>• Solve 1-2 problems daily (1 hour minimum)</li>
                      <li>• Focus on understanding, not just solving</li>
                      <li>• Review and optimize your solutions</li>
                      <li>• Track your progress in a spreadsheet</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Learning Resources:</h4>
                    <ul className="space-y-1">
                      <li>• ChatGPT for concept explanations</li>
                      <li>• LeetCode for practice problems</li>
                      <li>• Use ChatGPT for hints when stuck</li>
                      <li>• Join coding communities for motivation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSASection;
