import { useState, useEffect } from "react";

interface Stats {
  totalGenerations: number;
  todaysGenerations: number;
  totalWaitlistSignups: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats(data);
          setVisible(true);
        }
      })
      .catch(() => {
        // Silently fail — stats bar is optional
      });
  }, []);

  if (!visible || !stats) return null;

  return (
    <div className="mx-auto mt-16 max-w-lg text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {stats.totalGenerations.toLocaleString()} scripts generated
        </span>
        <span className="mx-2 text-gray-700">•</span>
        <span>
          {stats.todaysGenerations} today
        </span>
        <span className="mx-2 text-gray-700">•</span>
        <span>
          {stats.totalWaitlistSignups} on waitlist
        </span>
      </div>
    </div>
  );
}