import type { DsaYatraFeatureSpotlightItem } from "@tbe/types";

import Section from "../../layout/Section";
import {
  ProgressVisual,
  RevisionsVisual,
  RoadmapVisual,
  SheetsVisual,
} from "./DsaYatraSpotlightVisuals";

export type DsaYatraFeatureSpotlightsProps = {
  items: DsaYatraFeatureSpotlightItem[];
};

/**
 * Maps an item's eyebrow label to the correct interactive visual.
 * Falls back to a dark placeholder if no match is found.
 */
function SpotlightVisual({ eyebrow }: { eyebrow?: string }) {
  const key = (eyebrow ?? "").toLowerCase();
  if (key.includes("roadmap")) return <RoadmapVisual />;
  if (key.includes("sheet")) return <SheetsVisual />;
  if (key.includes("revision")) return <RevisionsVisual />;
  if (key.includes("progress")) return <ProgressVisual />;
  // Fallback dark placeholder
  return (
    <div
      role="img"
      aria-label="Feature visual placeholder"
      className="aspect-[4/3] w-full max-w-lg rounded-2xl border border-[#333333] bg-black"
    />
  );
}

/**
 * Alternating narrative rows — each with a unique interactive visual.
 */
export function DsaYatraFeatureSpotlights({
  items,
}: DsaYatraFeatureSpotlightsProps) {
  return (
    <Section
      id="feature-spotlights"
      className="bg-background px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center px-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Practice that fits your interviews
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Roadmap, sheets, revisions, and progress—built for consistency, not
            chaos.
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
              <div className="min-w-0 flex-1 space-y-5 text-center lg:text-left">
                {item.eyebrow ? (
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {item.eyebrow}
                  </p>
                ) : null}
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {item.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {item.description}
                </p>
                <ul className="inline-flex flex-col space-y-3 text-left text-foreground">
                  {item.bullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span className="text-muted-foreground">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-1 justify-center lg:max-w-lg lg:justify-end">
                <SpotlightVisual eyebrow={item.eyebrow} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
