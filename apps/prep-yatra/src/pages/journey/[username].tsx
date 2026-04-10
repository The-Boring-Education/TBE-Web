import { PrepYatraPublicJourneyPage } from "@tbe/components";
import type { GetStaticPaths, GetStaticProps } from "next";

/**
 * Skip static prerender for this dynamic route to avoid "Cannot read properties of null (reading 'useEffect')"
 * during build (e.g. duplicate React in monorepo). Pages are generated on-demand.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async () => ({
  props: {},
});

export default PrepYatraPublicJourneyPage;
