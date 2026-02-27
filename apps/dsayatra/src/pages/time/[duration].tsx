import { AlertTriangle, Clock, Target } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";

import { dsaYatraService } from "@tbe/services";
import { generateTimelineData } from "@/data/dsaData";
import { RoadmapView } from "@/components/RoadmapView";

export default function TimeRoadmap() {
  const router = useRouter();
  const duration = router.query.duration as string;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!duration) return;

    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const response = await dsaYatraService.getDSAQuestions();
        if (response && response.topics) {
          const generatedData = generateTimelineData(duration, response.topics);
          setData(generatedData);
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [duration]);

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

  const getDisclaimer = (duration: string) => {
    if (duration === '2months') {
      return (
        <Alert className="bg-orange-50/50 border-orange-200 text-orange-900 mb-8 rounded-xl shadow-sm">
          <AlertTitle className="text-lg font-bold flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            DSA understanding requires 5-6 hours/day commitment
          </AlertTitle>
          <AlertDescription className="space-y-2 mt-2 text-base">
            <p className="font-medium text-orange-800">⚠️ This timeline is for DSA revision, not learning from scratch.</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3 text-orange-700">
              <li><strong>5-6 hours/day</strong> = minimum 5 questions/day (or 3 new + 2 revision).</li>
              <li>DSA requires consistent time investment and revision.</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }

    if (duration === '3-4months') {
      return (
        <Alert className="bg-blue-50/50 border-blue-200 text-blue-900 mb-8 rounded-xl shadow-sm">
          <AlertTitle className="text-lg font-bold flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            This timeline is for learners with basic DSA knowledge
          </AlertTitle>
          <AlertDescription className="space-y-2 mt-2 text-base">
            <p className="font-medium text-blue-800">Ideal for those stuck on Arrays or Lists wanting to progress.</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3 text-blue-700">
              <li><strong>Recommended daily commitment:</strong> 3-4 hours/day</li>
              <li>You have intermediate knowledge, now solidifying fundamentals.</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }

    if (duration === '5+months') {
      return (
        <Alert className="bg-emerald-50/50 border-emerald-200 text-emerald-900 mb-8 rounded-xl shadow-sm">
          <AlertTitle className="text-lg font-bold flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-emerald-600" />
            This timeline is for complete DSA learners
          </AlertTitle>
          <AlertDescription className="space-y-2 mt-2 text-base">
            <p className="font-medium text-emerald-800">Perfect for 2-3 hours/day commitment over an extended period.</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3 text-emerald-700">
              <li>Slow and steady approach with ample time for deep learning.</li>
              <li>You will build DSA from scratch with proper understanding.</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <RoadmapView
      title={getTitle(duration || '')}
      description={getDescription(duration || '')}
      data={data}
      disclaimer={getDisclaimer(duration || '')}
    />
  );
}
