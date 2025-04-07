import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";

const questions = [
    {
        id: "username",
        question: "Choose Your Username",
        type: "text",
        required: true,
    },
    {
        id: "role",
        question: "What do you do?",
        type: "radio",
        options: ["Student", "Working Professional"],
        required: true,
    },
    {
        id: "usage",
        question: "How would you use the Platform?",
        type: "checkbox",
        options: ["Learning Tech", "Building Projects", "Interview Prep", "Job Search"],
        required: true,
    },
    {
        id: "contact",
        question: "Your Contact No (with Country Code)",
        type: "text",
        required: true,
    },
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [redirectTo, setRedirectTo] = useState("/dashboard");

    const current = questions[step];
    const isLast = step === questions.length - 1;

    useEffect(() => {
        if (router.query?.redirectTo) {
            setRedirectTo(router.query.redirectTo as string);
        }
    }, [router.query]);

    const handleChange = (id: string, value: any) => {
        setFormData({ ...formData, [id]: value });
    };

    const next = () => {
        if (!isLast) {
            setStep(step + 1);
        } else {
            console.log("Onboarding Data:", formData);
            localStorage.setItem("isOnboarded", "true");
            router.push(redirectTo);
        }
    };

    const prev = () => {
        if (step > 0) setStep(step - 1);
    };

    return (
        <>
            <Head>
                <title>Onboarding | TBE</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10">
                <div className="w-full max-w-xl bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--secondary)] p-8">

                    {/* Stepper Progress Bar */}
                    <div className="mb-10">
                        <div className="relative flex justify-between items-center px-2">
                            {/* Background Track */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />

                            {/* Animated Progress */}
                            <motion.div
                                className="absolute top-1/2 left-0 h-1 bg-red-600 rounded-full -translate-y-1/2"
                                initial={false}
                                animate={{ width: `${(step / (questions.length - 1)) * 100}%` }}
                                transition={{ duration: 0.4 }}
                            />

                            {/* Step Circles */}
                            {questions.map((_, index) => {
                                const isCompleted = index < step;
                                const isCurrent = index === step;

                                return (
                                    <div
                                        key={index}
                                        className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium 
                                            ${isCompleted
                                            ? "bg-red-600 text-white"
                                            : isCurrent
                                                ? "border-2 border-red-500 text-red-500 bg-white"
                                                : "border-2 border-gray-300 text-gray-400 bg-white"
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                            className="mb-6"
                        >
                            <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                                {current.question
                                    .split(" ")
                                    .slice(0, -1)
                                    .join(" ")}{" "}
                                <span className="text-[var(--primary)]">
                                    {current.question.split(" ").slice(-1)}
                                </span>
                            </h2>

                            {/* Text Field */}
                            {current.type === "text" && (
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-[var(--text-color)] focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="Type your answer..."
                                    onChange={(e) => handleChange(current.id, e.target.value)}
                                    required={current.required}
                                />
                            )}

                            {/* Radio Buttons */}
                            {current.type === "radio" && (
                                <div className="space-y-3">
                                    {current.options?.map((opt) => {
                                        const selected = formData[current.id] === opt;
                                        return (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3 transition-all duration-200 
                        ${selected ? "bg-red-50 border-red-500" : "border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={current.id}
                                                    value={opt}
                                                    onChange={(e) => handleChange(current.id, e.target.value)}
                                                    className="accent-red-500"
                                                    checked={selected}
                                                />
                                                <span className="text-black">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Checkbox */}
                            {current.type === "checkbox" && (
                                <div className="space-y-3">
                                    {current.options?.map((opt) => {
                                        const checked = (formData[current.id] || []).includes(opt);
                                        return (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3 transition-all duration-200 
                        ${checked ? "bg-red-50 border-red-500" : "border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const prev = formData[current.id] || [];
                                                        const updated = e.target.checked
                                                            ? [...prev, opt]
                                                            : prev.filter((v: string) => v !== opt);
                                                        handleChange(current.id, updated);
                                                    }}
                                                    className="accent-red-500"
                                                    checked={checked}
                                                />
                                                <span className="text-black">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        {step > 0 && (
                            <button
                                onClick={prev}
                                className="px-6 py-2 rounded-xl bg-white text-red-400 font-semibold border border-red-400 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm hover:scale-[1.02]"
                            >
                                ← Back
                            </button>

                        )}
                        <button
                            onClick={next}
                            className="px-6 py-2 rounded-xl bg-red-500 text-white font-semibold shadow-sm ml-auto transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                        >
                            {isLast ? "Finish" : "Next"} →
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}
