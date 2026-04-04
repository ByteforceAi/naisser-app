"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "naisser_search_history";
const MAX = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* */ }
  }, []);

  const add = useCallback((query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setHistory((prev) => {
      const next = [q, ...prev.filter((h) => h !== q)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== query);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(KEY); } catch { /* */ }
  }, []);

  return { history, add, remove, clear };
}
