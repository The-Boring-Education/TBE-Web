import type { PrepYatraFeatureSpotlightItem } from "@tbe/types";

import Section from "../../layout/Section";
import {
  PrepLogsVisual,
  PublicProfileVisual,
  RecruiterContactsVisual,
  ResourceSharingVisual,
} from "./PrepYatraSpotlightVisuals";

export type PrepYatraFeatureSpotlightsProps = {
  items: PrepYatraFeatureSpotlightItem[];
};

/**
 * Maps an item's id to the correct interactive visual.
 * Falls back to a light placeholder if no match is found.
 */
function SpotlightVisual({ id }: { id: string }) {
  if (id === "prep-logs") return <PrepLogsVisual />;
  if (id === "recruiter-network") return <RecruiterContactsVisual />;
  if (id === "resource-sharing") return <ResourceSharingVisual />;
  if (id === "public-profile") return <PublicProfileVisual />;

  // Fallback placeholder
  return (
    <div
      role="img"
      aria-label="Feature visual placeholder"
      className="aspect-[4/3] w-full max-w-lg rounded-2xl border border-gray-200 bg-gray-50"
    />
  );
}

/**
 * Alternating narrative rows — each with a unique interactive visual.
 */
export function PrepYatraFeatureSpotlights({
  items,
}: PrepYatraFeatureSpotlightsProps) {
  return (
    <Section
      id="prepyatra-feature-spotlights"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center px-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to master your interview prep
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-500">
            Track your study hours, manage recruiter contacts, discover
            community resources, and showcase your readiness.
          </p>
        </div>

        <div className="flex flex-col gap-20 lg:gap-24">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col gap-10 lg:flex-row lg:items-center ${
                item.imageSide === "left" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text side */}
              <div className="min-w-0 flex-1 space-y-5 text-center lg:text-left">
                {item.eyebrow ? (
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {item.eyebrow}
                  </p>
                ) : null}
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-500">{item.description}</p>
                <ul className="inline-flex flex-col space-y-3 text-left text-gray-700">
                  {item.bullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span className="text-gray-600">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual side */}
              <div className="flex w-full flex-1 justify-center lg:max-w-lg lg:justify-end">
                <SpotlightVisual id={item.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
