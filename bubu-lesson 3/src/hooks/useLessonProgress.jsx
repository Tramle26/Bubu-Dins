import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';

/**
 * Lesson progress. Kept deliberately small and serialisable so Bubu's backend
 * can persist it per student later — the shape is:
 *
 *   { [activityId]: { correct: boolean, attempts: number, at: ISO string } }
 *
 * Mastery, streaks and the mascot's health meter all read off this object.
 * Right now it lives in memory plus a best-effort localStorage cache; swap
 * `persist` for a fetch to your API and nothing else has to change.
 */

const STORAGE_KEY = 'bubu:progress:college-financial-portfolio';

const ProgressContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private window, blocked storage — progress just stays in memory */
  }
}

export function ProgressProvider({ children, gradedActivities = [] }) {
  const [results, setResults] = useState(load);

  useEffect(() => {
    persist(results);
  }, [results]);

  const record = useCallback((activityId, correct) => {
    setResults((prev) => {
      const prior = prev[activityId];
      // Once an activity is correct it stays correct — a student revisiting a
      // section to re-read should never lose credit they already earned.
      if (prior?.correct) return prev;
      return {
        ...prev,
        [activityId]: {
          correct,
          attempts: (prior?.attempts || 0) + 1,
          at: new Date().toISOString(),
        },
      };
    });
  }, []);

  const reset = useCallback(() => setResults({}), []);

  const value = useMemo(() => {
    const total = gradedActivities.length;
    const completed = gradedActivities.filter((a) => results[a.id]?.correct).length;
    const firstTry = gradedActivities.filter(
      (a) => results[a.id]?.correct && results[a.id]?.attempts === 1
    ).length;

    const bySection = {};
    for (const a of gradedActivities) {
      const s = (bySection[a.sectionId] ||= { total: 0, done: 0 });
      s.total += 1;
      if (results[a.id]?.correct) s.done += 1;
    }

    return {
      results,
      record,
      reset,
      total,
      completed,
      firstTry,
      bySection,
      ratio: total ? completed / total : 0,
    };
  }, [results, record, reset, gradedActivities]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}

/** Per-activity helper: current state plus a recorder bound to this id. */
export function useActivity(id) {
  const { results, record } = useProgress();
  const result = results[id];
  return {
    answered: Boolean(result),
    correct: Boolean(result?.correct),
    attempts: result?.attempts || 0,
    record: useCallback((ok) => record(id, ok), [record, id]),
  };
}
