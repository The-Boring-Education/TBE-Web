import { useRouter } from "next/router";

import { targetBasedData } from "@/data/dsaData";
import { RoadmapView } from "@/components/RoadmapView";

export default function TargetRoadmap() {
  const router = useRouter();
  const type = router.query.type as string;
  const data = targetBasedData[type as keyof typeof targetBasedData] || [];

  const getTitle = (type: string) => {
    switch (type) {
      case 'startup': return 'Startup Focus';
      case 'mnc': return 'Mid-size MNC Preparation';
      case 'faang': return 'FAANG Mastery';
      default: return 'DSA Roadmap';
    }
  };

  const getDescription = (type: string) => {
    switch (type) {
      case 'startup': return 'Master core fundamentals for startup interviews';
      case 'mnc': return 'Comprehensive preparation for established companies';
      case 'faang': return 'Advanced concepts for top-tier tech giants';
      default: return 'Your personalized learning path';
    }
  };

  return (
    <RoadmapView
      title={getTitle(type || '')}
      description={getDescription(type || '')}
      data={data}
    />
  );
}
