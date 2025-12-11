import { Navbar } from "@tbe/components";
import { Fragment } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  return (
    <Fragment>
      <Navbar variant="oncampus" />
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to OnCampus
            </h1>
            <ThemeToggle />
          </div>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              This is the OnCampus app with dark theme support. Toggle the theme using the button above.
            </p>
            <p>
              The following components now support dark theme:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Navbar component</li>
              <li>LoginCardNew component</li>
              <li>PrimaryCardWithCTA component</li>
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
