import { NotFoundPage } from "@tbe/components";

const NotFound = () => {
  return (
    <NotFoundPage
      config={{
        brandName: "Quizes",
        enableSEO: true,
        showBackButton: false,
        showSupport: true,
        homeUrl: "https://theboringeducation.com",
      }}
    />
  );
};

export default NotFound;
