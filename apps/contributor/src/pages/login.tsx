import { LoginCardNew } from "@tbe/components/login-card";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login – Contributor Portal | The Boring Education</title>
        <meta
          name="description"
          content="Sign in with Google to submit contributions, track reviews, and earn certificates on The Boring Education."
        />
      </Head>
      <LoginCardNew variant="contributor" />
    </>
  );
}
