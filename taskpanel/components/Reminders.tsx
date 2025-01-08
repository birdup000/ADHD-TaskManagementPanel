"use client";

import { useState } from "react";

type Reminder = {
  id: string;
  taskId: string;
  time: string;
  enabled: boolean;
};

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", taskId: "1", time: "09:00", enabled: true },
  ]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Reminders</h2>
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-3 bg-primary rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={reminder.time}
                  onChange={(e) =>
                    setReminders((prev) =>
                      prev.map((r) =>
                        r.id === reminder.id
                          ? { ...r, time: e.target.value }
                          : r
                      )
                    )
                  }
                  className="bg-transparent text-neutral-900 dark:text-neutral-100"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-200">
                  (Task #{reminder.taskId})
                </span>
              </div>
              <button
                onClick={() =>
                  setReminders((prev) =>
                    prev.map((r) =>
                      r.id === reminder.id
                        ? { ...r, enabled: !r.enabled }
                        : r
                    )
                  )
                }
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  reminder.enabled
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                }`}
              >
                <span className="text-white text-sm">✓</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}