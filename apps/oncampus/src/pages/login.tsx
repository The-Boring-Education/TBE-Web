import { Fragment } from "react"
import { Footer, LoginCardNew, Navbar } from "@tbe/components"
import { ThemeToggle } from "../components/ThemeToggle"

const Login = () => {
    return (
        <Fragment>
            <Navbar variant='oncampus' />
            <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
                <div className="container mx-auto px-4 pt-20">
                    <div className="flex justify-end mb-4">
                        <ThemeToggle />
                    </div>
                </div>
                <LoginCardNew variant='oncampus' />
                <Footer variant='oncampus' />
            </div>
        </Fragment>
    )
}

export default Login;