import { Footer, Navbar } from "@tbe/components";
import { Fragment } from "react";

import CampusPrepLanding from "./campus-prep";

export default function Home() {
  return (
    <Fragment>
      <Navbar variant="oncampus" theme="dark" />
      <CampusPrepLanding />
      <Footer variant="oncampus" />
    </Fragment>
  )
} 
