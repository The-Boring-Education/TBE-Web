import { NotFoundPage } from "@tbe/components";

const NotFound = () => {
  return (
    <NotFoundPage
      config={{
        brandName: "PrepYatra",
        enableSEO: true,
        showBackButton: false,
        showSupport: true,
        homeUrl: "https://prepyatra.theboringeducation.com/",
      }}
    />
  );
};

export default NotFound;
