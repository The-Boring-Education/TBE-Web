import { Fragment } from "react";

import LoginCardNew from "../../containers/Cards/LoginCardNew";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";

/**
 * On Campus sign-in page (`/login`).
 */
export default function OnCampusLoginPage() {
  return (
    <Fragment>
      <Navbar variant="oncampus" theme="dark" showThemeToggle />
      <div className="bg-white dark:bg-[#0A0A0A] pt-20 min-h-screen transition-colors duration-300">
        <LoginCardNew variant="oncampus" theme="dark" />
      </div>
      <Footer variant="oncampus" />
    </Fragment>
  );
}
