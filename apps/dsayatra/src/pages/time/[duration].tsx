import { useRouter } from "next/router";

import { timeBasedData } from "@/data/dsaData";
import { RoadmapView } from "@/components/RoadmapView";

export default function TimeRoadmap() {
  const router = useRouter();
  const duration = router.query.duration as string;
  const data = timeBasedData[duration as keyof typeof timeBasedData] || [];

  const getTitle = (duration: string) => {
    switch (duration) {
      case '2months': return '2 Months Intensive';
      case '3-4months': return '3-4 Months Balanced';
      case '5+months': return '5+ Months Mastery';
      default: return 'DSA Roadmap';
    }
  };

  const getDescription = (duration: string) => {
    switch (duration) {
      case '2months': return 'Crash course covering essential topics only';
      case '3-4months': return 'Comprehensive learning with balanced pace';
      case '5+months': return 'Complete mastery including advanced concepts';
      default: return 'Your time-based learning path';
    }
  };

  return (
    <RoadmapView
      title={getTitle(duration || '')}
      description={getDescription(duration || '')}
      data={data}
    />
  );
}
