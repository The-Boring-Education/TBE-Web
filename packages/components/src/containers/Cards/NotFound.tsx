import { Link } from "@tbe/components";
import React from "react";
import { RiAlarmWarningFill } from "react-icons/ri";

const NotFound = () => {
  return (
    <section className="bg-white dark:bg-background transition-colors duration-200">
      <div className="layout flex min-h-screen flex-col items-center justify-center text-center text-slate-900 dark:text-white px-4">
        <RiAlarmWarningFill
          className="drop-shadow-glow animate-flicker text-[#FF5757]"
          size={60}
        />
        <h1 className="mt-8 text-4xl md:text-6xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-md">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-md"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
