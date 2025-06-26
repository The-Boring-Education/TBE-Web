import React, { useEffect, useState } from 'react';

interface Question {
  _id: string;
  title: string;
  question: string;
  answer: string;
  frequency: 'Most Asked' | 'Asked Frequently' | 'Asked Sometimes';
  companyTypes: string[];
  priority: 'High' | 'Medium' | 'Low';
  isCompleted?: boolean;
}

interface UserPreferences {
  goal: '3Months' | '6Months' | '1Year';
  targetCompanies: string[];
  interviewCategories: string[];
}

interface PersonalizedQuestionsProps {
  userId: string;
  userPreferences: UserPreferences;
  category: string;
}

const PersonalizedQuestions: React.FC<PersonalizedQuestionsProps> = ({
  userId,
  userPreferences,
  category,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>(
    'all'
  );
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    fetchPersonalizedQuestions();
  }, [userId, category, userPreferences]);

  const fetchPersonalizedQuestions = async () => {
    try {
      setLoading(true);

      // This would fetch from your TBE webapp API with personalization
      const response = await fetch(
        `/api/v1/interview-prep/personalized?userId=${userId}&category=${category}&companies=${userPreferences.targetCompanies.join(
          ','
        )}&goal=${userPreferences.goal}`
      );
      const result = await response.json();

      if (result.status) {
        const personalizedQuestions = result.data.questions || [];
        setQuestions(personalizedQuestions);

        // Calculate progress
        const completed = personalizedQuestions.filter(
          (q: Question) => q.isCompleted
        ).length;
        setProgress({ completed, total: personalizedQuestions.length });
      }
    } catch (error) {
      console.error('Error fetching personalized questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markQuestionComplete = async (questionId: string) => {
    try {
      const response = await fetch('/api/v1/interview-prep/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId, isCompleted: true }),
      });

      if (response.ok) {
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId ? { ...q, isCompleted: true } : q
          )
        );
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }
    } catch (error) {
      console.error('Error marking question complete:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'Most Asked':
        return '🔥';
      case 'Asked Frequently':
        return '⭐';
      case 'Asked Sometimes':
        return '💫';
      default:
        return '❓';
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'all') return true;
    return q.priority.toLowerCase() === filter;
  });

  const progressPercentage =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
              {category} Interview Questions
            </h1>
            <p className='text-gray-600'>
              Personalized for {userPreferences.targetCompanies.join(', ')}{' '}
              companies
            </p>
          </div>

          {/* Progress Card */}
          <div className='bg-white rounded-lg border p-4 min-w-[200px]'>
            <div className='text-sm text-gray-600 mb-1'>Progress</div>
            <div className='text-2xl font-bold text-gray-900 mb-2'>
              {progress.completed}/{progress.total}
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className='text-xs text-gray-500 mt-1'>
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='mb-6'>
        <div className='flex flex-wrap gap-2'>
          {[
            { key: 'all', label: 'All Questions', count: questions.length },
            {
              key: 'high',
              label: 'High Priority',
              count: questions.filter((q) => q.priority === 'High').length,
            },
            {
              key: 'medium',
              label: 'Medium Priority',
              count: questions.filter((q) => q.priority === 'Medium').length,
            },
            {
              key: 'low',
              label: 'Low Priority',
              count: questions.filter((q) => q.priority === 'Low').length,
            },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Questions Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Questions List */}
        <div className='space-y-4'>
          {filteredQuestions.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No questions found for the selected filter.
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedQuestion?._id === question._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                } ${question.isCompleted ? 'opacity-75' : ''}`}
                onClick={() => setSelectedQuestion(question)}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-lg'>
                      {getFrequencyIcon(question.frequency)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                        question.priority
                      )}`}
                    >
                      {question.priority}
                    </span>
                    {question.isCompleted && (
                      <span className='px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200'>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>

                <h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>
                  {question.title}
                </h3>

                <p className='text-gray-600 text-sm line-clamp-3 mb-3'>
                  {question.question}
                </p>

                <div className='flex flex-wrap gap-1'>
                  {question.companyTypes.map((company, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded'
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Question Detail */}
        <div className='lg:sticky lg:top-6'>
          {selectedQuestion ? (
            <div className='bg-white border rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-lg'>
                    {getFrequencyIcon(selectedQuestion.frequency)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                      selectedQuestion.priority
                    )}`}
                  >
                    {selectedQuestion.priority} Priority
                  </span>
                </div>

                {!selectedQuestion.isCompleted && (
                  <button
                    onClick={() => markQuestionComplete(selectedQuestion._id)}
                    className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors'
                  >
                    Mark Complete
                  </button>
                )}
              </div>

              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                {selectedQuestion.title}
              </h2>

              <div className='mb-6'>
                <h3 className='font-semibold text-gray-900 mb-2'>Question:</h3>
                <p className='text-gray-700 leading-relaxed'>
                  {selectedQuestion.question}
                </p>
              </div>

              <div className='mb-6'>
                <h3 className='font-semibold text-gray-900 mb-2'>Answer:</h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {selectedQuestion.answer}
                  </p>
                </div>
              </div>

              <div className='border-t pt-4'>
                <div className='flex flex-wrap gap-2'>
                  <span className='text-sm text-gray-600'>Relevant for:</span>
                  {selectedQuestion.companyTypes.map((company, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
              <div className='text-gray-400 text-4xl mb-4'>📝</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Select a Question
              </h3>
              <p className='text-gray-600'>
                Click on any question from the list to view the detailed answer
                and explanation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedQuestions;
