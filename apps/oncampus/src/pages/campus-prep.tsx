import { OnCampusLandingPage } from "@tbe/components";
import { useUser } from "@tbe/hooks";
import { useRouter } from "next/router";
import { useEffect } from "react";

const CampusPrep = (props: any) => {
  const router = useRouter();
  const { isAuth, loading } = useUser();

  useEffect(() => {
    if (!loading && isAuth) {
      router.replace("/dashboard");
    }
  }, [isAuth, loading, router]);

  return <OnCampusLandingPage {...props} />;
};

export default CampusPrep;
