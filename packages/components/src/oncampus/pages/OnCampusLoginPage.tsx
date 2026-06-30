import { Fragment } from "react";

import LoginCardNew from "../../containers/Cards/LoginCardNew";

/**
 * On Campus sign-in page (`/login`).
 */
export default function OnCampusLoginPage() {
  return (
    <Fragment>
      <LoginCardNew variant="oncampus" />
    </Fragment>
  );
}
