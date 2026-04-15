import { Footer, LoginCardNew, Navbar } from "@tbe/components";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar variant="resume-yatra" />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <LoginCardNew variant="resume-yatra" />
      </div>
      <Footer />
    </div>
  );
}

// Force SSR for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}
