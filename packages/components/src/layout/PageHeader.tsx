import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    backText?: string;
    className?: string;
    onBack?: () => void;
}

// Reusable sticky header component with back navigation
export default function PageHeader({
    title,
    subtitle,
    backHref = "/dashboard",
    backText = "Back to Dashboard",
    className = "",
    onBack,
}: PageHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push(backHref);
        }
    };

    return (
        <header
            className={`sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur border-b border-gray-800 ${className}`}
        >
            <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-300 hover:text-primary transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{backText}</span>
                </button>
                <div className="text-right">
                    <h1 className="text-base md:text-lg font-semibold text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </header>
    );
}
