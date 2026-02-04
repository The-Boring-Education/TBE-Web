import { DsaQuestionList, LinkButton, LoadingSpinner, Navbar, QuestionDetailPanel } from "@tbe/components"
import { routes } from "@tbe/constants"
import { useApi, useUser } from "@tbe/hooks"
import type { DsaQuestion } from "@tbe/interface"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState, useMemo } from "react"

const TOPIC_LABELS: Record<string, string> = {
  ARRAY: "Array",
  STRING: "String",
  HASHMAP: "HashMap",
  TWO_POINTERS: "Two Pointers",
  SLIDING_WINDOW: "Sliding Window",
  BINARY_SEARCH: "Binary Search",
  SORTING: "Sorting",
  LINKED_LIST: "Linked List",
  STACK: "Stack",
  QUEUE: "Queue",
  TREE: "Tree",
  BINARY_TREE: "Binary Tree",
  BST: "Binary Search Tree",
  GRAPH: "Graph",
  DFS: "Depth First Search",
  BFS: "Breadth First Search",
  BACKTRACKING: "Backtracking",
  DYNAMIC_PROGRAMMING: "Dynamic Programming",
  GREEDY: "Greedy",
  MATH: "Math",
  BIT_MANIPULATION: "Bit Manipulation",
  TRIE: "Trie",
  HEAP: "Heap",
  UNION_FIND: "Union Find",
  PREFIX_SUM: "Prefix Sum",
}

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
      content: question.content,
      description: question.description,  
      examples: question.examples,        
      constraints: question.constraints,  
      topics: question.topics,
      companyType: question.companyTypes,
      domain: question.domain,
      leetcodeLink: question.leetcodeLink,
      youtubeSearchLink: question.youtubeSearchLink,
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
    <div className="flex flex-col h-screen bg-black overflow-hidden p-2">
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

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-2 pt-4 w-full">
        {/* Left Sidebar - Topics or Questions */}
        <div className={`flex-shrink-0 overflow-y-auto scrollbar-hide pb-2 ${selectedTopic ? 'h-1/3 lg:h-auto w-full lg:w-60' : 'flex-1 lg:flex-none w-full lg:w-60'}`}>
          {!selectedTopic ? (
            /* Topic List */
            <div className="flex flex-col w-full">
              {topicsWithCounts.map(({ topic, count, label }) => (
                <div
                  key={topic}
                  className="w-full border border-gray-800 rounded-lg px-3 py-2.5 mb-1 hover:border-gray-600 hover:bg-[#111] transition-all duration-200 cursor-pointer bg-transparent"
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-300 text-sm font-medium truncate group-hover:text-white">
                      {label}
                    </p>
                    <span className="text-xs font-semibold text-gray-500">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-2 px-2">
                <h2 className="text-lg font-bold text-white">
                  {TOPIC_LABELS[selectedTopic] || selectedTopic}
                </h2>
                <p className="text-xs text-gray-400">
                  {filteredQuestions.length} questions
                </p>
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

        <div className={`flex-1 min-w-0 bg-[#0A0A0A] border border-gray-700 rounded-lg p-6 overflow-hidden flex flex-col shadow-sm ${!selectedTopic ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedTopic ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">Select a topic to start</p>
            </div>
          ) : (
            <QuestionDetailPanel question={selectedQuestion} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DSAPrepPage
