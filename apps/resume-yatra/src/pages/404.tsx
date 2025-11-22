import { NotFoundPage } from "@tbe/components";

export default function NotFound() {
  return (
    <NotFoundPage
      config={{
        brandName: "ResumeYatra",
        description:
          "The page you're looking for doesn't exist or has been moved.",
        showBackButton: false,
        showSupport: true,
        homeUrl: "https://resumeyatra.theboringeducation.com/",
      }}
    />
  );
}
