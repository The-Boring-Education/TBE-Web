import React from "react";
import { Text, Badge, Button } from "@tbe/components";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "Step 1 · Foundations",
    desc: "Arrays · Maths · Basic patterns",
    problems: "0 / 31 problems",
    tags: ["Array basics", "Prefix sums", "Two pointers intro"],
  },
  {
    title: "Step 2 · Sorting & Searching",
    desc: "Sorting · Binary search on answers",
    problems: "0 / 24 problems",
    tags: ["Basic sorts", "Binary search", "Search space questions"],
  },
  {
    title: "Step 3 · Linked Lists & Stacks",
    desc: "Linked list patterns · Stack usage",
    problems: "0 / 30 problems",
    tags: ["Singly list", "Two pointer LL", "Monotonic stack basics"],
  },
  {
    title: "Step 4 · Recursion & Backtracking",
    desc: "Recursion patterns · Classic backtracking",
    problems: "0 / 25 problems",
    tags: ["Recursion basics", "Subsets / permutations", "Grid backtracking"],
  },
];

const DsaPrepPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div>
          <Text level="h2" className="text-4xl text-white font-extrabold">
            DSA Practice Roadmap
          </Text>
          <Text level="p" className="text-white/70 mt-3 max-w-2xl">
            Walk through hand-picked topics from basics to advanced. Your progress will be saved once you log in.
          </Text>
        </div>

        {/* Long stat bar below the description */}
        <div className="mt-6 w-full">
          <div className="rounded-full border border-[#FF5757]/25 px-0.5 py-0.5 bg-[#0b0b0b] shadow-[0_14px_50px_rgba(255,87,87,0.06)] w-full">
            <div className="rounded-full bg-[#080808] px-6 py-1 flex items-center justify-between max-w-full">

              <div className="flex items-center gap-16">
                <div className="text-left">
                  <Text level="p" className="text-sm text-white">Overall Progress</Text>
                  <Text level="h4" className="text-2xl text-white/60 font-semibold mt-1">0%</Text>
                </div>

                <div className="h-14 border-l border-[#202225]" />

                <div className="text-left">
                  <Text level="p" className="text-sm text-white">Total Problems</Text>
                  <Text level="h4" className="text-2xl text-white/60 font-semibold mt-1">0 / 455</Text>
                </div>

                <div className="h-14 border-l border-[#202225]" />

                <div className="text-left">
                  <Text level="p" className="text-sm text-white">Easy / Medium / Hard</Text>
                  <Text level="h4" className="text-2xl text-white/60 font-semibold mt-1">0 / 0 / 0</Text>
                </div>
              </div>

              <div className="flex items-center">
                <Button variant="OUTLINE" size="MEDIUM" className="rounded-full border-[#FF5757] text-[#FF5757] hover:bg-[#FF5757]/10 w-20 h-20 flex items-center justify-center">
                  <div className="text-center leading-tight">
                    <div className="text-sm font-semibold">Login</div>
                    <div className="text-sm">to track</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left - steps */}
        <div className="col-span-8 space-y-4">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-[#111111] rounded-xl border border-primary p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text level="h4" className="font-semibold text-white">{s.title}</Text>
                  <Text level="p" className="text-white text-sm mt-1">{s.desc}</Text>
                </div>
                <Text level="p" className="text-white/60 text-sm">{s.problems}</Text>
              </div>

              <div className="flex items-center gap-1 mt-3 flex-wrap text-white/70">
                {s.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-xs px-2 py-0.5 transition-colors duration-75 ease-in-out hover:bg-[#FF5757]/10 hover:text-[#FF5757] rounded-md border-[#FF5757]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#FF5757]/30"
                  >
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="mt-4">
                <Button variant="PRIMARY" size="SMALL" className="shadow-sm py-2 px-3">
                  View problems <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Right - info */}
        <aside className="col-span-4 space-y-6">
          <div className="bg-[#111111] rounded-xl border border-gray-800 p-4">
            <Text level="h6" className="heading-6 mb-2 text-primary">How this sheet works</Text>
            <ol className="list-decimal list-inside text-white/70 text-sm space-y-2">
              <li>Pick the current step and open "View problems".</li>
              <li>Solve questions in any platform of your choice.</li>
              <li>Log in to save what you've solved and see stats.</li>
            </ol>
          </div>

          <div className="bg-gradient-to-r from-red-700 to-red-500 rounded-xl p-4 text-white">
            <Text level="h6" className="heading-6 mb-2">Tip</Text>
            <Text level="p" className="text-sm">Finish one step per week</Text>
            <Text level="p" className="text-white/90 text-sm mt-2">Stick to a small, focused set of topics every week instead of jumping randomly across the sheet.</Text>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DsaPrepPage;
