import React, { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";

export interface PersonalizationQuizData {
  interests: string[];
  goals?: string[];
  experienceLevel: string;
  weeklyCommitment: string;
  skipped: boolean;
}

interface PersonalizationQuizProps {
  initialData?: Partial<PersonalizationQuizData>;
  onSubmit: (data: PersonalizationQuizData) => Promise<void> | void;
  onClose?: () => void;
  isSaving?: boolean;
  onCooking?: (cooking: boolean) => void;
}

const STEP_1_TOPICS = [
  { id: "web_dev", label: "Web development" },
  { id: "data_science", label: "Data science" },
  { id: "computer_science", label: "Computer science" },
  { id: "web_design", label: "Web design" },
  { id: "ai", label: "Artificial intelligence" },
  { id: "ml", label: "Machine learning" },
  { id: "game_dev", label: "Game development" },
  { id: "mobile_dev", label: "Mobile development" },
  { id: "data_vis", label: "Data visualization" },
  { id: "cloud", label: "Cloud computing" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "not_sure", label: "Not sure yet" },
];

const STEP_2_GOALS = [
  { id: "switch_careers", label: "Switch careers" },
  { id: "job_skill", label: "Learn a skill for my job" },
  { id: "build_project", label: "Build a project" },
  { id: "school", label: "Learn for school" },
  { id: "fun", label: "Learn for fun" },
  { id: "not_sure", label: "Not sure yet" },
];

const STEP_3_EXPERIENCE = [
  {
    id: "beginner",
    title: "Beginner",
    desc: "I've never coded, or I only know the basics.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    desc: "I've created some projects with code.",
  },
  {
    id: "advanced",
    title: "Advanced",
    desc: "I have professional experience writing code.",
  },
];

export const PersonalizationQuiz: React.FC<PersonalizationQuizProps> = ({
  initialData,
  onSubmit,
  isSaving = false,
  onCooking,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData?.interests || ["data_vis"],
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    initialData?.goals || ["switch_careers"],
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    initialData?.experienceLevel || "beginner",
  );
  const [isCooking, setIsCooking] = useState<boolean>(false);
  const [cookingStep, setCookingStep] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isCooking) {
      interval = setInterval(() => {
        setCookingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isCooking]);

  const handleSelectInterest = (id: string) => {
    setSelectedInterests([id]);
    setTimeout(() => {
      setStep(2);
    }, 150);
  };

  const handleSelectGoal = (id: string) => {
    setSelectedGoals([id]);
    setTimeout(() => {
      setStep(3);
    }, 150);
  };

  const handleSelectExperience = (id: string) => {
    setExperienceLevel(id);
    setTimeout(() => {
      setIsCooking(true);
      onCooking?.(true);
      const submitData: PersonalizationQuizData = {
        interests: selectedInterests,
        goals: selectedGoals,
        experienceLevel: id,
        weeklyCommitment: "regular",
        skipped: false,
      };

      setTimeout(async () => {
        await onSubmit(submitData);
      }, 4200);
    }, 150);
  };

  if (isCooking || isSaving) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-white/20 backdrop-blur-[6px] flex flex-col items-center justify-center p-4 text-slate-800 text-center font-sans select-none">
        <style>{`
          @keyframes tiltSequence {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-18deg); }
            50% { transform: rotate(18deg); }
            75% { transform: rotate(-8deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-tilt-1 { animation: tiltSequence 4s ease-in-out infinite; }
          .animate-tilt-2 { animation: tiltSequence 4s ease-in-out 0.6s infinite; }
          .animate-tilt-3 { animation: tiltSequence 4s ease-in-out 1.2s infinite; }
        `}</style>

        {/* Small Micro Tech Logos */}
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 animate-tilt-1 flex items-center justify-center">
            <img
              src="/images/html.png"
              alt="HTML5"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-6 h-6 sm:w-7 sm:h-7 animate-tilt-2 flex items-center justify-center">
            <img
              src="/images/css.png"
              alt="CSS3"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-6 h-6 sm:w-7 sm:h-7 animate-tilt-3 flex items-center justify-center">
            <img
              src="/images/js.png"
              alt="JavaScript"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Minimal Subtle Text */}
        <h2 className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
          Crafting your learning dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full text-[#10162F] py-4 px-4 sm:px-8 lg:px-12 flex flex-col relative font-sans">
      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col my-4">
        {/* Title Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10162F] tracking-tight">
            Find what's right for you
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Answer 3 quick questions to get recommendations that match your
            interests.
          </p>
        </div>

        {/* 3-Column Question Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vertical Stepper */}
          <div className="md:col-span-1 flex md:flex-col items-center md:items-start justify-center gap-4 py-2">
            {[1, 2, 3].map((num) => {
              const isCompleted = step > num;
              const isActive = step === num;
              return (
                <div
                  key={num}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? "bg-[#10162F] text-white shadow-xs"
                      : isActive
                        ? "border-2 border-[#10162F] text-[#10162F] bg-white font-extrabold"
                        : "border border-slate-300 text-slate-400 bg-transparent font-medium"
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-4 h-4" /> : num}
                </div>
              );
            })}
          </div>

          {/* Center Column: Questions & Options */}
          <div className="md:col-span-7 space-y-5">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#10162F]">
                  What do you want to learn about?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STEP_1_TOPICS.map((topic) => {
                    const isSelected = selectedInterests.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleSelectInterest(topic.id)}
                        className={`px-4 py-3.5 border text-left text-xs sm:text-sm font-semibold transition-all rounded-xs shadow-xs ${
                          isSelected
                            ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold"
                            : "bg-white border-slate-300 hover:border-slate-800 text-slate-800"
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#10162F]">
                  What do you want to achieve?
                </h2>

                <div className="flex flex-col gap-3">
                  {STEP_2_GOALS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleSelectGoal(goal.id)}
                        className={`w-full px-5 py-3.5 border text-left text-xs sm:text-sm font-semibold transition-all rounded-xs shadow-xs ${
                          isSelected
                            ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold"
                            : "bg-white border-slate-300 hover:border-slate-800 text-slate-800"
                        }`}
                      >
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#10162F]">
                  How much coding experience do you have?
                </h2>

                <div className="flex flex-col gap-3">
                  {STEP_3_EXPERIENCE.map((exp) => {
                    const isSelected = experienceLevel === exp.id;
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => handleSelectExperience(exp.id)}
                        className={`w-full p-4 border text-left transition-all rounded-xs shadow-xs ${
                          isSelected
                            ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold"
                            : "bg-white border-slate-300 hover:border-slate-800 text-slate-800"
                        }`}
                      >
                        <h3 className="font-bold text-sm sm:text-base text-[#10162F]">
                          {exp.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          {exp.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Back Button */}
            {step > 1 && (
              <div className="pt-4 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 1 | 2)}
                  className="text-xs sm:text-sm font-bold text-indigo-700 hover:underline"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Illustration & Note */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
            {step === 1 && (
              <div className="space-y-4">
                <img
                  src="/images/note.png"
                  alt="Learn topics"
                  className="max-h-56 sm:max-h-64 object-contain mx-auto"
                />
                <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xs mx-auto">
                  We have hundreds of courses that cover just about everything.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <img
                  src="/images/target.png"
                  alt="Set goals"
                  className="max-h-56 sm:max-h-64 object-contain mx-auto"
                />
                <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xs mx-auto">
                  People who set a goal are 40% more likely to achieve it.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <img
                  src="/images/laptop.png"
                  alt="Coding experience"
                  className="max-h-56 sm:max-h-64 object-contain mx-auto"
                />
                <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xs mx-auto">
                  Our hands-on learning environment is designed for all levels.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center text-[10px] text-slate-400 pt-4">
        The Boring Education • Personalized Learning Roadmap
      </div>
    </div>
  );
};
