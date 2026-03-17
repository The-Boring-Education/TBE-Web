import { AuthCallback } from "@tbe/auth";

export default AuthCallback;

// Force dynamic render so this page is never statically prerendered (avoids
// "Cannot read properties of null (reading 'useEffect')" during SSG).
export async function getServerSideProps() {
  return { props: {} };
}
