import SEO from "@tbe/components/layout/SEO";
import { APP_CONFIGS, DEFAULT_OG_IMAGE, getSEOMeta } from "@tbe/constants";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `@tbe/components` resolves its own `next` install under pnpm, so the mock
// must target that copy; mocking the bare "next/head" specifier here would
// only replace the testing app's copy and the real Head renders nothing.
vi.mock(
  "../../../../../../packages/components/node_modules/next/head.js",
  () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
);

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/shiksha?ref=share" }),
}));

const getMeta = (container: HTMLElement, key: string) =>
  container
    .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
    ?.getAttribute("content");

describe("SEO social preview tags", () => {
  it("renders absolute Open Graph and Twitter tags for the default image", () => {
    const seoMeta = getSEOMeta("/", "platform");
    const { container } = render(<SEO seoMeta={seoMeta} appId="platform" />);

    expect(getMeta(container, "og:title")).toBe(seoMeta.title);
    expect(getMeta(container, "og:description")).toBe(seoMeta.description);
    expect(getMeta(container, "og:type")).toBe("website");
    expect(getMeta(container, "og:url")).toBe(
      `${APP_CONFIGS.platform.domain}/shiksha?ref=share`,
    );
    expect(getMeta(container, "og:image")).toBe(DEFAULT_OG_IMAGE.url);
    expect(getMeta(container, "og:image:secure_url")).toBe(
      DEFAULT_OG_IMAGE.url,
    );
    expect(getMeta(container, "og:image:width")).toBe("1200");
    expect(getMeta(container, "og:image:height")).toBe("630");
    expect(getMeta(container, "og:image:alt")).toBe(DEFAULT_OG_IMAGE.alt);
    expect(getMeta(container, "twitter:card")).toBe("summary_large_image");
    expect(getMeta(container, "twitter:image")).toBe(DEFAULT_OG_IMAGE.url);
  });

  it("uses the www host so og:url and canonical do not redirect", () => {
    expect(APP_CONFIGS.platform.domain).toBe(
      "https://www.theboringeducation.com",
    );
    expect(DEFAULT_OG_IMAGE.url.startsWith("https://")).toBe(true);
  });

  it("falls back to the default image for SVG or empty images", () => {
    const base = getSEOMeta("/", "platform");

    const svg = render(
      <SEO seoMeta={{ ...base, image: "https://cdn.example.com/hero.svg" }} />,
    );
    expect(getMeta(svg.container, "og:image")).toBe(DEFAULT_OG_IMAGE.url);

    const empty = render(<SEO seoMeta={{ ...base, image: "" }} />);
    expect(getMeta(empty.container, "og:image")).toBe(DEFAULT_OG_IMAGE.url);
  });

  it("makes relative images absolute and upgrades http to https", () => {
    const base = getSEOMeta("/", "platform");

    const relative = render(
      <SEO seoMeta={{ ...base, image: "/images/course.png" }} />,
    );
    expect(getMeta(relative.container, "og:image")).toBe(
      `${APP_CONFIGS.platform.domain}/images/course.png`,
    );
    expect(getMeta(relative.container, "og:image:width")).toBeUndefined();

    const insecure = render(
      <SEO seoMeta={{ ...base, image: "http://cdn.example.com/card.png" }} />,
    );
    expect(getMeta(insecure.container, "og:image")).toBe(
      "https://cdn.example.com/card.png",
    );
  });
});
