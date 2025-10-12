import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { Loader2 } from "lucide-react"
import { useResumeBuilder } from "@/hooks/use-resume-builder"
import InitialChoice from "@/components/builder/InitialChoice"
import TemplatePrompt from "@/components/builder/TemplatePrompt"
import BuilderMain from "@/components/builder/BuilderMain"
import ResultScreen from "@/components/builder/ResultScreen"

export default function Builder() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const builder = useResumeBuilder()

    // Redirect to auth if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth")
        }
    }, [status, router])

    // Show loading state
    if (status === "loading") {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'>
                <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
            </div>
        )
    }

    // Not authenticated
    if (!session) {
        return null
    }

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

// Force SSR for this page
export async function getServerSideProps() {
    return {
        props: {}
    }
}
