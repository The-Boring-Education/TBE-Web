import { Fragment } from "react"
import { Footer, LoginCardNew, Navbar } from "@tbe/components"

const Login = () => {
    return (
        <Fragment>
            <Navbar variant='oncampus' theme="dark" />
            <div className="bg-[#0A0A0A] pt-20 min-h-screen">
                <LoginCardNew variant='oncampus' theme="dark" />
            </div>
            <Footer variant='oncampus' />
        </Fragment>
    )
}

export default Login;