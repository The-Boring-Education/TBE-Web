import { LearningEnvironmentLayout } from "@tbe/components";
import type { ComponentProps } from "react";

type Props = Omit<
  ComponentProps<typeof LearningEnvironmentLayout>,
  "showGamification"
>;

/**
 * Learning layout with the gamification points badge (matches Navbar variant="oncampus").
 */
const OnCampusLearningLayout = (props: Props) => (
  <LearningEnvironmentLayout {...props} showGamification />
);

export default OnCampusLearningLayout;
