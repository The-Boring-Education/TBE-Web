import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { SEO, Button } from '@/components';
import { useOnboardingRedirect } from '@/hooks';
import { UserResponse } from '@/interfaces';

interface Question {
    id: keyof UserResponse;
    question: string;
    type: 'text' | 'radio' | 'checkbox';
    required?: boolean;
    options?: string[];
}

const questions: Question[] = [
    {
        id: 'username',
        question: 'Choose Your Username',
        type: 'text',
        required: true,
    },
    {
        id: 'role',
        question: 'What do you do?',
        type: 'radio',
        options: ['Student', 'Working Professional'],
        required: true,
    },
    {
        id: 'usage',
        question: 'How would you use the Platform?',
        type: 'checkbox',
        options: ['Learning Tech', 'Building Projects', 'Interview Prep', 'Job Search'],
        required: true,
    },
    {
        id: 'contact',
        question: 'Your Contact No (with Country Code)',
        type: 'text',
        required: true,
    },
];

const Onboarding = () => {
    const router = useRouter();
    useOnboardingRedirect();

    const [step, setStep] = useState<number>(0);
    const [formData, setFormData] = useState<UserResponse>({} as UserResponse);
    const [redirectTo, setRedirectTo] = useState<string>('/dashboard');

    const current = questions[step];
    const isLast = step === questions.length - 1;

    useEffect(() => {
        if (router.query?.redirectTo) {
            setRedirectTo(router.query.redirectTo as string);
        }
    }, [router.query]);

    const handleChange = (id: keyof UserResponse, value: unknown) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const next = () => {
        if (!isLast) {
            setStep((prev) => prev + 1);
        } else {
            localStorage.setItem('isOnboarded', 'true');
            router.push(redirectTo);
        }
    };

    const prev = () => {
        if (step > 0) setStep((prev) => prev - 1);
    };

    return (
        <>
            <SEO
                seoMeta={{
                    title: 'Onboarding | TBE',
                    description: 'Let us understand your needs to personalize your experience.',
                    url: 'https://thebigengineers.com',
                    type: 'website',
                    siteName: 'The Big Engineers',
                    image: '/images/og-default.png',
                    robots: 'follow, index',
                }}
            />

            <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8">

                    {/* Step Progress Bar */}
                    <div className="mb-10">
                        <div className="relative flex justify-between items-center px-2">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                            <motion.div
                                className="absolute top-1/2 left-0 h-1 bg-red-600 rounded-full -translate-y-1/2"
                                animate={{ width: `${(step / (questions.length - 1)) * 100}%` }}
                                transition={{ duration: 0.4 }}
                            />
                            {questions.map((_, index) => {
                                const isCompleted = index < step;
                                const isCurrent = index === step;
                                return (
                                    <div
                                        key={index}
                                        className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium 
                      ${isCompleted
                                            ? 'bg-red-600 text-white'
                                            : isCurrent
                                                ? 'border-2 border-red-500 text-red-500 bg-white'
                                                : 'border-2 border-gray-300 text-gray-400 bg-white'}`}
                                    >
                                        {index + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Transition */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                            className="mb-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {current.question.split(' ').slice(0, -1).join(' ')}{' '}
                                <span className="text-red-500">{current.question.split(' ').slice(-1)}</span>
                            </h2>

                            {/* Text Input */}
                            {current.type === 'text' && (
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="Type your answer..."
                                    onChange={(e) => handleChange(current.id, e.target.value)}
                                    required={current.required}
                                />
                            )}

                            {/* Radio Options */}
                            {current.type === 'radio' && (
                                <div className="space-y-3">
                                    {current.options?.map((opt) => {
                                        const selected = formData[current.id] === opt;
                                        return (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3 transition-all duration-200 
                          ${selected ? 'bg-red-50 border-red-500' : 'border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={current.id}
                                                    value={opt}
                                                    onChange={(e) => handleChange(current.id, e.target.value)}
                                                    checked={selected}
                                                    className="accent-red-500"
                                                />
                                                <span className="text-gray-800">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Checkbox Options */}
                            {current.type === 'checkbox' && (
                                <div className="space-y-3">
                                    {current.options?.map((opt) => {
                                        const prevChecked = (formData[current.id] as string[]) || [];
                                        const checked = prevChecked.includes(opt);
                                        return (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3 transition-all duration-200 
                          ${checked ? 'bg-red-50 border-red-500' : 'border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={opt}
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked
                                                            ? [...prevChecked, opt]
                                                            : prevChecked.filter((v) => v !== opt);
                                                        handleChange(current.id, updated);
                                                    }}
                                                    className="accent-red-500"
                                                />
                                                <span className="text-gray-800">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        {step > 0 && (
                            <Button variant="OUTLINE" text="← Back" onClick={prev} />
                        )}
                        <Button
                            variant="PRIMARY"
                            text={isLast ? 'Finish →' : 'Next →'}
                            onClick={next}
                            className="ml-auto"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Onboarding;
