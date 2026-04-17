import type { TailorYourJourneyProps } from "@tbe/interface";

import { TailorJourneyVisual } from "../../dsayatra/sections/DsaYatraSpotlightVisuals";

const TailorYourJourney = ({
  heading,
  highlightText,
  description,
  features,
  imageVariant = "src",
  imageSrc,
  imageAlt,
}: TailorYourJourneyProps) => (
  <div
    id="tailor-journey"
    className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 md:py-16"
  >
    <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center">
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {heading} <span className="text-primary">{highlightText}</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <ul className="inline-flex flex-col space-y-4 text-left text-gray-700 dark:text-gray-300">
          {features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>
                <strong>{feature.label}:</strong> {feature.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex w-full flex-1 justify-center lg:justify-end">
        {imageVariant === "placeholder" ? (
          <TailorJourneyVisual />
        ) : (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl"
          />
        )}
      </div>
    </div>
  </div>
);

export default TailorYourJourney;
