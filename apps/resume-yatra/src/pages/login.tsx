import { Footer,LoginCardNew, Navbar } from "@tbe/components"

export default function AuthPage() {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 p-0'>
            <Navbar variant='resume-yatra' />
            <div className="mt-8">
                <LoginCardNew variant='resume-yatra' />
                <Footer  />
            </div>
        </div>
    )
}

// Force SSR for this page
export async function getServerSideProps() {
    return {
        props: {}
    }
}
