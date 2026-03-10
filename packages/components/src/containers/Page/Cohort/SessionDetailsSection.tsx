// TODO: Refactor this component to use a more generic approach for session details
import {
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { FlexContainer, Text } from "@tbe/components";

const sessions = [
  {
    title: "Project Building Phase",
    description:
      "Build and validate your product idea with personalized guidance.",
    gradient: "from-indigo-500 to-purple-600",
    icon: <UsersIcon className="w-8 h-8 text-secondary" />,
    items: [
      {
        title: "Weekly 1:1 Sessions",
        icon: <UserGroupIcon className="w-6 h-6 text-indigo-300" />,
        desc: "Private mentoring sessions to push your project forward.",
      },
      {
        title: "Product Roundtables",
        icon: (
          <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-indigo-300" />
        ),
        desc: "Collaborate, share insights, and solve challenges with peers.",
      },
    ],
  },
  {
    title: "Interview Prep Phase",
    description:
      "Master interview skills with the right tools and expert feedback.",
    gradient: "from-pink-500 to-red-500",
    icon: <ClipboardDocumentCheckIcon className="w-8 h-8 text-secondary" />,
    items: [
      {
        title: "AI Resume Building",
        icon: <DocumentTextIcon className="w-6 h-6 text-pink-300" />,
        desc: "Craft a standout resume using AI suggestions.",
      },
      {
        title: "Interview Plan with ChatGPT",
        icon: <SparklesIcon className="w-6 h-6 text-pink-300" />,
        desc: "Structured preparation mapped to your experience.",
      },
      {
        title: "Mock Interviews",
        icon: (
          <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-pink-300" />
        ),
        desc: "Simulated interviews with detailed mentor feedback.",
      },
    ],
  },
];

const SessionDetailsSection = () => (
  <section className="bg-gradient-to-b from-gray-950 to-black text-white py-20 px-4">
    <FlexContainer className="max-w-6xl mx-auto gap-8">
      <FlexContainer className="md:gap-3 gap-2" direction="col">
        <Text
          className="heading-2 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          level="h2"
          textCenter
        >
          Cohort Roadmap
        </Text>
        <Text className="text-gray-300" level="p" textCenter>
          Cohort is designed to help you build your product and prepare for
          interviews.
        </Text>
      </FlexContainer>
      <div className="grid md:grid-cols-2 gap-10">
        {sessions.map((phase, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-xl bg-gradient-to-br ${phase.gradient} transform transition hover:scale-105`}
          >
            <FlexContainer className="flex items-center gap-4 mb-5">
              <div className="p-2 bg-white rounded-full">{phase.icon}</div>
              <FlexContainer
                className="gap-0.5 md:justify-center"
                justifyCenter={false}
              >
                <Text className="heading-5 text-white" level="h5">
                  {phase.title}
                </Text>
                <Text
                  className="paragraph text-white/90 md:text-center"
                  level="p"
                >
                  {phase.description}
                </Text>
              </FlexContainer>
            </FlexContainer>
            <ul className="space-y-4">
              {phase.items.map((item, i) => (
                <li key={i} className="flex items-start flex-wrap gap-3">
                  <div>{item.icon}</div>
                  <FlexContainer className="gap-0.5" justifyCenter={false}>
                    <Text className="heading-5 text-white" level="h5">
                      {item.title}
                    </Text>
                    <Text className="paragraph text-white/80" level="p">
                      {item.desc}
                    </Text>
                  </FlexContainer>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FlexContainer>
  </section>
);

export default SessionDetailsSection;
