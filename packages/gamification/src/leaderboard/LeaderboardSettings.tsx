"use client";

import useLeaderboardPreferences from "../useLeaderboardPreferences";

const Toggle = ({
  checked,
  disabled,
  label,
  description,
  isDark,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  isDark: boolean;
  onChange: (next: boolean) => void;
}) => (
  <label className="flex items-start justify-between gap-4 py-3">
    <span>
      <span
        className={`block text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {label}
      </span>
      <span
        className={`block text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}
      >
        {description}
      </span>
    </span>
    <input
      checked={checked}
      className="mt-1 h-5 w-5 accent-indigo-600"
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      type="checkbox"
    />
  </label>
);

/** Profile-settings block for Leaderboard Visibility and leaderboard emails. */
const LeaderboardSettings = ({ isDark = false }: { isDark?: boolean }) => {
  const { preferences, loading, updatePreferences, updating } =
    useLeaderboardPreferences();

  if (loading || !preferences) return null;

  return (
    <section
      className={`rounded-xl border p-4 ${
        isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"
      }`}
    >
      <h3
        className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        Leaderboard
      </h3>
      <div
        className={`divide-y ${isDark ? "divide-white/10" : "divide-gray-100"}`}
      >
        <Toggle
          checked={preferences.visible && !preferences.excluded}
          description={
            preferences.excluded
              ? "Your account has been removed from leaderboards by the TBE team."
              : "Others can see your name, photo and points. You always see your own rank."
          }
          disabled={updating || preferences.excluded}
          isDark={isDark}
          label="Show me on leaderboards"
          onChange={(visible) => void updatePreferences({ visible })}
        />
        <Toggle
          checked={preferences.emails}
          description="A short note when you finish in the top of a daily, weekly or monthly leaderboard."
          disabled={updating}
          isDark={isDark}
          label="Leaderboard emails"
          onChange={(emails) => void updatePreferences({ emails })}
        />
      </div>
    </section>
  );
};

export default LeaderboardSettings;
