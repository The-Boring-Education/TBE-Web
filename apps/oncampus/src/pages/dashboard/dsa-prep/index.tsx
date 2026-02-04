import { DsaQuestionList, LoadingSpinner, Navbar, QuestionDetailPanel, FlexContainer, Text } from "@tbe/components"
import { routes, TOPIC_LABELS } from "@tbe/constants"
import { useApi, useUser } from "@tbe/hooks"
import type { DsaQuestion } from "@tbe/interface"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState, useMemo } from "react"



const DSAPrepPage = () => {
  const router = useRouter()
  const { loading: userLoading, isAuth } = useUser()
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const { response, loading: sheetsLoading } = useApi("dsa-sheet", {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
  })

  const dsaQuestions = React.useMemo(() => {
    const data = response?.data?.questions

    if (!Array.isArray(data)) return []

    return data.map((question: any) => ({
      id: question._id,
      name: question.title,
      difficultyLevel: question.difficulty,
      answer: question.answer,
      resources: question.resources,
      topics: question.topics,
      companyType: question.companyTypes,
      domain: question.domain,
    }))
  }, [response])

  const topicsWithCounts = useMemo(() => {
    const topicMap = new Map<string, number>()

    dsaQuestions.forEach((question) => {
      const primaryTopic = question.topics?.[0]
      if (primaryTopic) {
        topicMap.set(primaryTopic, (topicMap.get(primaryTopic) || 0) + 1)
      }
    })

    return Array.from(topicMap.entries())
      .map(([topic, count]) => ({
        topic,
        count,
        label: TOPIC_LABELS[topic] || topic
      }))
      .sort((a, b) => {
        const priorityA = Object.keys(TOPIC_LABELS).indexOf(a.topic)
        const priorityB = Object.keys(TOPIC_LABELS).indexOf(b.topic)
        if (priorityA !== -1 && priorityB !== -1) {
          return priorityA - priorityB
        }
        return a.label.localeCompare(b.label)
      })
  }, [dsaQuestions])

  const filteredQuestions = useMemo(() => {
    if (!selectedTopic) return []
    return dsaQuestions.filter(q => q.topics?.[0] === selectedTopic)
  }, [dsaQuestions, selectedTopic])

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login")
    }
  }, [userLoading, isAuth, router])

  const handleQuestionClick = (question: DsaQuestion) => {
    setSelectedQuestion(question)
  }

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic)
    setSelectedQuestion(null)
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
    setSelectedQuestion(null)
  }

  if (sheetsLoading || userLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <FlexContainer direction="col" className="h-screen bg-black overflow-hidden" fullWidth itemCenter={false} justifyCenter={false} wrap={false}>
      <Navbar theme="dark" variant="oncampus" />

      <FlexContainer direction="col" className="lg:flex-row flex-1 min-h-0 w-full mt-16" itemCenter={false} justifyCenter={false} wrap={false}>
        {/* Left Sidebar - Topics or Questions */}
        <div className={`flex flex-col flex-shrink-0 border-r border-gray-800 transition-all duration-300 ${selectedTopic ? 'w-full lg:w-72' : 'flex-1 lg:flex-none w-full lg:w-72'}`}>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-default">
            {!selectedTopic ? (
              <div className="space-y-4">
                <div className="mb-6">
                  <Link
                    href={routes.oncampus.dashboard}
                    className="border border-gray-700 hover:border-gray-500 text-white text-xs px-3 py-1.5 rounded-md transition-all duration-200 bg-transparent hover:bg-[#111] inline-block mb-4"
                  >
                    ← Back to Dashboard
                  </Link>
                  <h1 className="text-xl font-bold text-white">Available Topics</h1>
                  <p className="text-xs text-gray-400">Pick a category to start</p>
                </div>

                <FlexContainer direction="col" fullWidth itemCenter={false} justifyCenter={false} wrap={false}>
                  {topicsWithCounts.map(({ topic, count, label }) => (
                    <div
                      key={topic}
                      className="w-full border border-gray-800 rounded-lg px-3 py-2.5 mb-2 hover:border-gray-600 hover:bg-[#111] transition-all duration-200 cursor-pointer bg-transparent group"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <FlexContainer className="justify-between" fullWidth itemCenter>
                        <Text level="p" className="text-gray-300 text-sm font-medium truncate group-hover:text-white">
                          {label}
                        </Text>
                        <Text level="span" className="text-xs font-semibold text-gray-500">
                          {count}
                        </Text>
                      </FlexContainer>
                    </div>
                  ))}
                </FlexContainer>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleBackToTopics}
                  className="border border-gray-700 hover:border-gray-500 text-white text-xs px-3 py-1.5 rounded-md transition-all duration-200 bg-transparent hover:bg-[#111] mb-4 flex items-center gap-1"
                >
                  ← Back to Topics
                </button>

                <div className="mb-4">
                  <Text level="p" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Questions
                  </Text>
                  <DsaQuestionList
                    questions={filteredQuestions}
                    selectedQuestionId={selectedQuestion?.id}
                    onQuestionClick={handleQuestionClick}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#0A0A0A] ${!selectedTopic ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 scroll-smooth" id="right-scroll-area">
            {!selectedTopic ? (
              <FlexContainer className="h-full" itemCenter justifyCenter fullWidth wrap={false}>
                <div className="text-center space-y-2">
                  <Text level="p" className="text-gray-400 text-lg">Select a topic from the left to start practiced</Text>
                  <Text level="p" className="text-gray-500 text-sm italic">Unlock your potential with structured learning</Text>
                </div>
              </FlexContainer>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8 pb-6 border-b border-gray-800/50">
                  <Text level="h2" className="text-2xl font-bold text-white mb-1">
                    {TOPIC_LABELS[selectedTopic] || selectedTopic}
                  </Text>
                  <Text level="p" className="text-sm text-gray-400">
                    Showing {filteredQuestions.length} curated questions
                  </Text>
                </div>

                <div className="pb-10">
                  <QuestionDetailPanel question={selectedQuestion} />
                </div>

                {/* End of Content Indicator */}
                <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col items-center justify-center text-center space-y-4 pb-20">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-gray-800"></div>
                    <Text level="p" className="text-xs text-gray-500 uppercase tracking-widest font-medium">End of Content</Text>
                    <div className="h-px w-8 bg-gray-800"></div>
                  </div>
                  <button
                    onClick={() => {
                      const rightCol = document.getElementById('right-scroll-area');
                      rightCol?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Back to Top
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FlexContainer>
    </FlexContainer>
  )
}

export default DSAPrepPage
