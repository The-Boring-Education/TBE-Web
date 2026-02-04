import { DsaQuestionList, LinkButton, LoadingSpinner, Navbar, QuestionDetailPanel, FlexContainer, Text } from "@tbe/components"
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
    <FlexContainer direction="col" className="h-screen bg-black overflow-hidden p-2" fullWidth itemCenter={false} justifyCenter={false}>
      <div className="text-white flex-shrink-0">
        <Navbar theme="dark" variant="oncampus" />
        <div className="mt-20 px-2 border-b border-gray-800 pb-2 mb-2">
          {selectedTopic ? (
            <button
              onClick={handleBackToTopics}
              className="border border-gray-700 hover:border-gray-500 text-white text-sm px-4 py-1.5 rounded-md transition-all duration-200 bg-transparent hover:bg-[#111]"
            >
              Back to Topics
            </button>
          ) : (
            <Link
              href={routes.oncampus.dashboard}
              className="border border-gray-700 hover:border-gray-500 text-white text-sm px-4 py-1.5 rounded-md transition-all duration-200 bg-transparent hover:bg-[#111] inline-block"
            >
              Back
            </Link>
          )}
        </div>
      </div>

      <FlexContainer direction="col" className="lg:flex-row flex-1 min-h-0 gap-2 pt-4 w-full" itemCenter={false} justifyCenter={false}>
        {/* Left Sidebar - Topics or Questions */}
        <div className={`flex-shrink-0 overflow-y-auto scrollbar-hide pb-2 ${selectedTopic ? 'h-1/3 lg:h-auto w-full lg:w-60' : 'flex-1 lg:flex-none w-full lg:w-60'}`}>
          {!selectedTopic ? (
            /* Topic List */
            <FlexContainer direction="col" fullWidth itemCenter={false} justifyCenter={false}>
              {topicsWithCounts.map(({ topic, count, label }) => (
                <div
                  key={topic}
                  className="w-full border border-gray-800 rounded-lg px-3 py-2.5 mb-1 hover:border-gray-600 hover:bg-[#111] transition-all duration-200 cursor-pointer bg-transparent"
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
          ) : (
            <>
              <div className="mb-2 px-2">
                <Text level="h2" className="text-lg font-bold text-white">
                  {TOPIC_LABELS[selectedTopic] || selectedTopic}
                </Text>
                <Text level="p" className="text-xs text-gray-400">
                  {filteredQuestions.length} questions
                </Text>
              </div>

              <DsaQuestionList
                questions={filteredQuestions}
                selectedQuestionId={selectedQuestion?.id}
                onQuestionClick={handleQuestionClick}
              />
            </>
          )}
        </div>

        <div className={`bg-gray-800 flex-shrink-0 ${!selectedTopic ? 'hidden lg:block' : ''} h-px w-full my-2 lg:my-0 lg:w-px lg:h-auto lg:mx-2`} />

        <FlexContainer direction="col" className={`flex-1 min-w-0 bg-[#0A0A0A] border border-gray-700 rounded-lg p-6 overflow-hidden shadow-sm ${!selectedTopic ? 'hidden lg:flex' : 'flex'}`} itemCenter={false} justifyCenter={false}>
          {!selectedTopic ? (
            <FlexContainer className="h-full" itemCenter justifyCenter fullWidth>
              <Text level="p" className="text-gray-400 text-lg">Select a topic to start</Text>
            </FlexContainer>
          ) : (
            <QuestionDetailPanel question={selectedQuestion} />
          )}
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  )
}

export default DSAPrepPage
