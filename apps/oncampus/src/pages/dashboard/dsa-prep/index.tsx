import { DsaQuestionList, LoadingSpinner, Navbar, QuestionDetailPanel, FlexContainer, Text, LinkButton, Button } from "@tbe/components"
import { routes, TOPIC_LABELS } from "@tbe/constants"
import { useApi, useUser } from "@tbe/hooks"
import type { DsaQuestion } from "@tbe/interface"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState, useMemo } from "react"


import { transformDsaQuestion } from "../../../utils/dsaHelpers"

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

    return data.map(transformDsaQuestion)
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
      <FlexContainer direction="col" className="h-screen bg-black overflow-hidden gap-3" fullWidth itemCenter={false} justifyCenter={false} wrap={false}>
        <Navbar theme="dark" variant="oncampus" />
        <div className="flex-1 flex items-center justify-center">
          <Text level="p" className="text-gray-800">Loading...</Text>
        </div>
      </FlexContainer>
    )
  }

  return (
    <FlexContainer direction="col" className="h-screen bg-black overflow-hidden gap-3" fullWidth itemCenter={false} justifyCenter={false} wrap={false} >
      <Navbar theme="dark" variant="oncampus" />

      <FlexContainer direction="col" className="lg:flex-row flex-1 min-h-0 w-full mt-16" itemCenter={false} justifyCenter={false} wrap={false}>
        {/* Left Sidebar - Topics or Questions */}
        <div className={`flex flex-col flex-shrink-0 border-r border-gray-800 transition-all duration-300 ${selectedTopic ? 'w-full lg:w-72' : 'flex-1 lg:flex-none w-full lg:w-72'}`}>
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin-grey">
            {!selectedTopic ? (
              <div className="space-y-3">
                <div className="mb-3">
                  <LinkButton
                    href={routes.oncampus.dashboard}
                    className="mb-3"
                    buttonProps={{
                      variant: "OUTLINE",
                      size: "SMALL",
                      text: "← Back",
                      className: "border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 "
                    }}
                  />
                  <h1 className="mt-2 text-xl font-bold text-white">Explore Topics</h1>
                  <p className="text-xs text-gray-400">Choose a Topic to Begin</p>
                </div>

                <FlexContainer direction="col" fullWidth itemCenter={false} justifyCenter={false} wrap={false} className="gap-1">
                  {topicsWithCounts.map(({ topic, count, label }) => (
                    <div
                      key={topic}
                      className="w-full border border-gray-800 rounded-lg px-3 py-2.5 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer bg-transparent group"
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
              <div className="space-y-3">
                <Button
                  onClick={handleBackToTopics}
                  variant="OUTLINE"
                  size="SMALL"
                  text="← Back"
                  className="border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10"
                />

                <div className="mb-1">
                  <h1 className="mt-2 text-xl font-bold text-white">Explore Questions</h1>
                  <p className="mb-2 text-xs text-gray-400">Choose a Question to Begin</p>
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
          <div className="flex-1 overflow-y-auto scrollbar-thin-grey px-2 py-4 scroll-smooth" id="right-scroll-area">
            {!selectedTopic ? (
              <FlexContainer className="h-full" itemCenter justifyCenter fullWidth wrap={false}>
                <div className="text-center space-y-2">
                  <Text level="p" className="text-gray-400 text-lg">Select a topic from the left to start practiced</Text>
                  <Text level="p" className="text-gray-500 text-sm italic">Unlock your potential with structured learning</Text>
                </div>
              </FlexContainer>
            ) : (
              <div className="w-full px-4">
                <div className="mb-4 pb-4 border-b border-gray-800/50">
                  <Text level="h2" className="text-2xl font-bold text-white mb-1">
                    {TOPIC_LABELS[selectedTopic] || selectedTopic}
                  </Text>
                  <Text level="p" className="text-sm text-gray-400">
                    Continue your {TOPIC_LABELS[selectedTopic] || selectedTopic} preparation journey.
                  </Text>
                </div>

                <div className="pb-1 w-full">
                  <QuestionDetailPanel question={selectedQuestion} />
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
