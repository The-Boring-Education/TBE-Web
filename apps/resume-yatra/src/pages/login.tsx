import { LoginCardNew } from "@tbe/components";

export default function AuthPage() {
  return <LoginCardNew variant="resume-yatra" />;
}

// Force SSR for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}
