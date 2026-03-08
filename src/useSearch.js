import { useState, useEffect, useMemo, useRef } from "react";

// Cache loaded+processed rows per tab key so we never re-process
const rowCache = {};

export function useSearch(tab, query) {
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const activeTab = useRef(tab.key);

  useEffect(() => {
    activeTab.current = tab.key;
    setError(null);

    if (rowCache[tab.key]) {
      setRows(rowCache[tab.key]);
      return;
    }

    setRows(null);

    tab
      .file()
      .then((mod) => {
        const data = mod.default;
        const processed = tab.toRows(data);
        rowCache[tab.key] = processed;
        if (activeTab.current === tab.key) {
          setRows(processed);
        }
      })
      .catch((err) => {
        console.error(err);
        if (activeTab.current === tab.key) {
          setError("Failed to load data.");
        }
      });
  }, [tab.key]);

  const results = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const isNumeric = /^\d+$/.test(q);

    const matched = rows.filter((row) => {
      for (const key of tab.searchKeys) {
        const val = row[key];
        if (val === undefined || val === null || val === "") continue;
        const str = String(val).toLowerCase();
        if (isNumeric) {
          if (key === "id" && str === q) return true;
        } else {
          if (str.includes(q)) return true;
        }
      }
      return false;
    });

    return matched.slice(0, 500);
  }, [rows, query, tab.key]);

  return { rows, results, error, loading: rows === null && !error };
}
