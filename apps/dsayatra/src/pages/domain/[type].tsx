import { useRouter } from "next/router";

import { domainBasedData } from "@/data/dsaData";
import { RoadmapView } from "@/components/RoadmapView";

export default function DomainRoadmap() {
  const router = useRouter();
  const type = router.query.type as string;
  const data = domainBasedData[type as keyof typeof domainBasedData] || [];

  const getTitle = (type: string) => {
    switch (type) {
      case 'fullstack': return 'Full-stack Development';
      case 'datascience': return 'Data Science Focus';
      case 'appdev': return 'App Development';
      case 'ml': return 'Machine Learning';
      case 'analyst': return 'Data Analyst';
      case 'ai': return 'Artificial Intelligence';
      default: return 'DSA Roadmap';
    }
  };

  const getDescription = (type: string) => {
    switch (type) {
      case 'fullstack': return 'End-to-end development problem patterns';
      case 'datascience': return 'Analytics and ML-oriented challenges';
      case 'appdev': return 'Mobile and app development focus';
      case 'ml': return 'AI and optimization problems';
      case 'analyst': return 'Data manipulation and analysis';
      case 'ai': return 'Advanced AI algorithm challenges';
      default: return 'Your domain-specific learning path';
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
