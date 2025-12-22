import React from "react";
import { Text, Button } from "@tbe/components";
import { ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    title: "1 - Input / Output & Basics",
    items: [
      { title: "Add Two Integers", slug: "add-two-integers", id: 2235, url: "https://leetcode.com/problems/add-two-integers/" },
      { title: "Convert Temperature", slug: "convert-temperature", id: 2469, url: "https://leetcode.com/problems/convert-temperature/" },
      { title: "Difference Between Product and Sum of Digits", slug: "product-sum-digits", id: 1281, url: "https://leetcode.com/problems/product-of-digits-or-sum/" },
    ],
  },
  {
    title: "2 - If-Else & Conditions",
    items: [
      { title: "Check If Number is Even or Odd", slug: "is-even", id: 3099, url: "https://leetcode.com/problems/check-if-number-is-even-or-odd/" },
      { title: "Maximum of Two Numbers", slug: "max-two", id: 1, url: "https://leetcode.com/problems/maximum-of-two-numbers/" },
    ],
  },
  {
    title: "3 - Loops (for / while)",
    items: [
      { title: "Print Numbers Using Loop", slug: "print-numbers", id: 1929, url: "https://leetcode.com/problems/print-numbers/" },
      { title: "Sum of First N Numbers", slug: "sum-n", id: 2652, url: "https://leetcode.com/problems/sum-of-first-n-numbers/" },
      { title: "Count Digits in a Number", slug: "count-digits", id: 2119, url: "https://leetcode.com/problems/count-digits/" },
      { title: "Reverse an Integer", slug: "reverse-integer", id: 7, url: "https://leetcode.com/problems/reverse-integer/" },
    ],
  },
  {
    title: "4 - Math Basics",
    items: [
      { title: "Palindrome Number", slug: "palindrome", id: 9, url: "https://leetcode.com/problems/palindrome-number/" },
      { title: "Fibonacci Number", slug: "fibonacci", id: 509, url: "https://leetcode.com/problems/fibonacci-number/" },
      { title: "Power of Two", slug: "power-of-two", id: 231, url: "https://leetcode.com/problems/power-of-two/" },
      { title: "Count Primes", slug: "count-primes", id: 204, url: "https://leetcode.com/problems/count-primes/" },
      { title: "Self Dividing Numbers", slug: "self-dividing", id: 728, url: "https://leetcode.com/problems/self-dividing-numbers/" },
    ],
  },
  {
    title: "5 - Modulo & FizzBuzz",
    items: [
      { title: "Fizz Buzz", slug: "fizz-buzz", id: 412, url: "https://leetcode.com/problems/fizz-buzz/" },
      { title: "Add Digits", slug: "add-digits", id: 258, url: "https://leetcode.com/problems/add-digits/" },
    ],
  },
  {
    title: "6 - Bit Manipulation (Intro)",
    items: [
      { title: "Number of 1 Bits", slug: "hamming-weight", id: 191, url: "https://leetcode.com/problems/number-of-1-bits/" },
      { title: "Counting Bits", slug: "counting-bits", id: 338, url: "https://leetcode.com/problems/counting-bits/" },
    ],
  },
  {
    title: "7 - Functions & Recursion",
    items: [
      { title: "Factorial", slug: "factorial", id: 172, url: "https://leetcode.com/problems/factorial/" },
      { title: "Trailing Zeros", slug: "trailing-zeros", id: 170, url: "https://leetcode.com/problems/factorial-trailing-zeroes/" },
    ],
  },
  {
    title: "8 - Strings (Basics)",
    items: [
      { title: "Reverse String", slug: "reverse-string", id: 344, url: "https://leetcode.com/problems/reverse-string/" },
      { title: "Valid Palindrome", slug: "valid-palindrome", id: 125, url: "https://leetcode.com/problems/valid-palindrome/" },
      { title: "Length of Last Word", slug: "length-of-last-word", id: 58, url: "https://leetcode.com/problems/length-of-last-word/" },
      { title: "Check If Sentence Is Pangram", slug: "pangram", id: 1832, url: "https://leetcode.com/problems/check-if-the-sentence-is-pangram/" },
    ],
  },
  {
    title: "9 - Mini Logic Builders",
    items: [
      { title: "Harshad Number", slug: "harshad-number", id: 3099, url: "https://leetcode.com/problems/narcissistic-number/" },
      { title: "Find Greatest Common Divisor", slug: "greatest-common-divisor", id: 1979, url: "https://leetcode.com/problems/greatest-common-divisor/" },
      { title: "Convert Binary to Decimal", slug: "convert-binary-to-decimal", id: 1290, url: "https://leetcode.com/problems/binary-number-to-integer/" },
      { title: "Square Root of a Number", slug: "sqrtx", id: 69, url: "https://leetcode.com/problems/sqrtx/" },
      { title: "Sum of Digits of String After Convert", slug: "sum-of-digits", id: 1945, url: "https://leetcode.com/problems/sum-of-digits-of-string-after-convert/" },
      { title: "Power of Three (bonus)", slug: "power-of-three", id: 326, url: "https://leetcode.com/problems/power-of-three/" },
    ],
  },
];

const FoundationsPage: React.FC = () => {
  return (
    <div className="max-w-full mx-auto overflow-x-hidden no-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text level="h1" className="text-[#FF5757]">Level 0 · Before Arrays</Text>
          <Text level="h2" className="text-white text-3xl font-bold mt-1">Foundations</Text>
          <Text level="p" className="text-white/70 mt-2">30 hand-picked LeetCode questions to warm up your logic, maths, and syntax before jumping into arrays.</Text>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="bg-gradient-to-r from-[#0f1724] to-[#08121a] rounded-md px-3 py-2 text-slate-200/80 border border-[#12222b]">30 questions</div>
          <div className="bg-gradient-to-r from-[#0f1724] to-[#08121a] rounded-md px-3 py-2 text-slate-200/80 border border-[#12222b]">Beginner friendly</div>
        </div>
      </div>

      <div className="grid grid-cols-16 gap-4 thin-scrollbar">
        {/* sections grid */}
        {SECTIONS.map((sec, idx) => (
          <div key={sec.title} className="col-span-2 bg-transparent">
            <div tabIndex={0} className={`bg-gradient-to-br from-[#0A0A0A] to-[#0b1520] border rounded-lg p-5 h-[420px] flex flex-col min-w-0 overflow-hidden transition-transform duration-75 ease-out hover:-translate-y-2 hover:border-[#FF5757]/30 hover:ring-1 hover:ring-[#FF5757]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF5757]/30 ${idx === 0 ? 'border-[#FF5757]/60 shadow-[0_28px_80px_rgba(255,87,87,0.12)]' : 'border-[#12222b]'}`}>
              <Text level="h5" className="text-slate-100 font-semibold mb-3">{sec.title}</Text>

              <div className="space-y-2 flex-1 overflow-hidden">
                {sec.items.map((it) => (
                  <div key={it.slug} tabIndex={0} className="flex items-start justify-between bg-[#071422] border border-[#16232b] rounded-md p-2 gap-3 flex-wrap transition-colors duration-75 ease-in-out hover:bg-[#0e3038] focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#FF5757]/30">
                    <div className="text-slate-200 text-sm min-w-0 max-w-[calc(100%-120px)] break-words">{it.title}
                      <div className="text-xs text-slate-400 mt-1">LeetCode #{it.id}</div>
                    </div>
                    <a href={it.url ?? `https://leetcode.com/problems/${it.slug}/`} target="_blank" rel="noreferrer" className="inline-block">
                      <div className="text-xs font-medium text-[#FF5757] border border-[#FF5757]/30 rounded-full px-3 py-1 min-w-[100px] text-center transition-colors duration-75 ease-in-out hover:bg-[#FF5757] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#FF5757]/30">LeetCode question</div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* right-side empty columns to accommodate wide layout */}
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <div className="bg-gradient-to-br from-[#071025] to-[#0b1520] border border-[#12222b] rounded-lg p-4">
            <Text level="p" className="text-slate-200 font-medium">You're ready for Arrays 🔥</Text>
            <Text level="p" className="text-white/70 mt-2">You've gone through all Level 0 logic builders. Move ahead to start solving structured array problems.</Text>
            <div className="mt-4">
              <a href="/dashboard/dsa-prep#arrays">
                <Button variant="OUTLINE" size="MEDIUM">Go to Arrays section</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Hide scrollbars for elements with .no-scrollbar */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Thin, light scrollbar for elements that still scroll */
        .thin-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
        .thin-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }

        /* Ensure no visual shifting when hiding scrollbars */
        html.no-scrollbar, body.no-scrollbar { overflow: hidden; }
      `}</style>
    </div>
  );
};

export default FoundationsPage;
