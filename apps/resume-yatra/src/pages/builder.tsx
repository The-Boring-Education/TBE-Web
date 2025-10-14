import { ProtectedRoute } from "@tbe/auth"
import { Loader2 } from "lucide-react"

import BuilderMain from "@/components/builder/BuilderMain"
import InitialChoice from "@/components/builder/InitialChoice"
import ResultScreen from "@/components/builder/ResultScreen"
import TemplatePrompt from "@/components/builder/TemplatePrompt"
import { useResumeBuilder } from "@/hooks/use-resume-builder"

const LoadingScreen = () => (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
    </div>
)

function BuilderContent() {
    const builder = useResumeBuilder()

    // Show initial choice screen
    if (builder.hasResume === null) {
        return <InitialChoice builder={builder} />
    }

    // Show template prompt if user chose to create new resume
    if (!builder.hasResume && !builder.showTemplate) {
        return <TemplatePrompt builder={builder} />
    }

    // Show result screen
    if (builder.showResult) {
        return <ResultScreen builder={builder} />
    }

    // Show main builder interface
    return <BuilderMain builder={builder} />
}

export default function Builder() {
    return (
        <ProtectedRoute
            redirectTo='/auth'
            loadingComponent={<LoadingScreen />}>
            <BuilderContent />
        </ProtectedRoute>
    )
}

// Force SSR for this page
export async function getServerSideProps() {
    return {
        props: {}
    }
}
