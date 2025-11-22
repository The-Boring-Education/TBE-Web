/* eslint-disable simple-import-sort/imports */
import { useRouter } from "next/router";

import Button from "../Buttons/Button";
import SEO from "../../layout/SEO";
import { getSEOMeta } from "@tbe/constants";

interface NotFoundConfig {
  brandName?: string;
  tagline?: string;
  heading?: string;
  description?: string;
  supportEmail?: string;
  homeUrl?: string;
  showSupport?: boolean;
  enableSEO?: boolean;
  showBackButton?: boolean;
}

interface NotFoundPageProps {
  config?: NotFoundConfig;
}

export const NotFoundPage = ({ config = {} }: NotFoundPageProps) => {
  const router = useRouter();

  const {
    brandName,
    tagline = "by The Boring Education",
    heading = "Page Not Found",
    description = "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.",
    showBackButton = true,
    showSupport = false,
    supportEmail = "support@theboringeducation.com",
    enableSEO = false,
    homeUrl = "/",
  } = config;

  const seoMeta = enableSEO ? getSEOMeta("/404") : null;

  return (
    <>
      {enableSEO && seoMeta && <SEO seoMeta={seoMeta} />}

      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full space-y-6">
          {/* Brand Name */}
          {brandName && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary">{brandName}</h2>
              {tagline && (
                <p className="text-gray-600 text-sm mt-1">{tagline}</p>
              )}
            </div>
          )}

          {/* 404 Text */}
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-800">{heading}</h2>

          {/* Description */}
          <p className="text-gray-600">{description}</p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 justify-center flex-wrap">
            <Button
              variant="PRIMARY"
              text="Go to Homepage"
              onClick={() => router.push(homeUrl)}
              active
              animationType="BOUNCE"
              className="rounded-md px-8"
            />

            {showBackButton && (
              <Button
                variant="OUTLINE"
                text="Go Back"
                onClick={() => router.back()}
                active
                animationType="BOUNCE"
                className="rounded-md bg-white hover:bg-primary hover:text-white px-8"
              />
            )}
          </div>

          {/* Support Link */}
          {showSupport && (
            <div className="pt-6">
              <p className="text-sm text-gray-500">Need help?</p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-primary hover:underline text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
