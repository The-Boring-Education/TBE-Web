import { Fragment } from "react"
import { Footer, LoginCardNew, Navbar } from "@tbe/components"

const Login = () => {
    return (
        <Fragment>
            <Navbar variant='oncampus' />
            <div className="mt-8">
                <LoginCardNew variant='oncampus' />
                <Footer variant='oncampus' />
            </div>
        </Fragment>
    )
}

export default Login;