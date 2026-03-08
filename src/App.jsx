import { useState, useCallback } from "react";
import { TABS } from "./tabs.js";
import { useSearch } from "./useSearch.js";
import DropTable from "./DropTable.jsx";
import VarbitVarp from "./VarbitVarp.jsx";
import Skeletons from "./Skeletons.jsx";
import ClientScripts from "./ClientScripts.jsx";
import Enums from "./Enums.jsx";
import WorldMaps from "./WorldMaps.jsx";
import Items from "./Items.jsx";
import Npcs from "./Npcs.jsx";

const CUSTOM_TABS = {
  items: <Items />,
  npcs: <Npcs />,
  drop_tables: <DropTable />,
  enums: <Enums />,
  world_maps: <WorldMaps />,
  varbits_varps: <VarbitVarp />,
  client_scripts: <ClientScripts />,
  skeletons: <Skeletons />,
};

function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-sm mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or ID..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
      />
      {value && (
        <button onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
      )}
    </div>
  );
}

function ResultsTable({ tab, results, loading, error, total, query }) {
  if (error) return <div className="text-red-400 text-sm py-8 text-center">{error}</div>;
  if (loading && query.trim()) return (
    <div className="text-zinc-500 text-sm py-8 text-center">Loading {tab.label}...</div>
  );
  if (!query.trim()) return (
    <div className="py-20 text-center">
      <div className="text-zinc-600 text-sm">Search {tab.label.toLowerCase()} by name or ID</div>
      {total != null && <div className="text-zinc-700 text-xs mt-1">{total.toLocaleString()} entries</div>}
    </div>
  );
  return (
    <>
      <div className="text-xs text-zinc-600 mb-2">
        {results.length.toLocaleString()} result{results.length !== 1 ? "s" : ""}
        {results.length === 500 ? " (capped at 500)" : ""}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              {tab.columns.map((col) => (
                <th key={col.key} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={tab.columns.length} className="py-8 text-center text-zinc-600 text-sm">No results found.</td>
              </tr>
            ) : (
              results.map((row) => (
                <tr key={String(row.id) + (row.stringId || "")}
                  className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors">
                  {tab.columns.map((col) => {
                    const val = row[col.key];
                    const display = val === undefined || val === null || val === "" ? "" : String(val);
                    return (
                      <td key={col.key}
                        className="py-1.5 pr-6 whitespace-nowrap max-w-xs truncate"
                        style={{
                          color: col.key === "id" ? "#71717a"
                            : col.key === "name" ? "#e4e4e7"
                            : col.key === "examine" ? "#71717a"
                            : "#a1a1aa",
                        }}
                        title={display}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TabPanel({ tab, query }) {
  const { rows, results, error, loading } = useSearch(tab, query);
  return (
    <ResultsTable tab={tab} results={results} loading={loading} error={error} total={rows?.length} query={query} />
  );
}

export default function App() {
  const [activeKey, setActiveKey] = useState("items");
  const [query, setQuery] = useState("");
  const activeTab = TABS.find((t) => t.key === activeKey);
  const isCustom = activeKey in CUSTOM_TABS;

  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
    setQuery("");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-0.5">Void 634 — Cache Lookup</h1>
          <p className="text-xs text-zinc-600">Open source RuneScape · Revision 634 cache definitions</p>
        </div>

        <div className="flex flex-wrap gap-1 mb-5 border-b border-zinc-800 pb-0">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-t transition-colors -mb-px border-b-2 ${
                activeKey === tab.key
                  ? "text-white border-amber-500 bg-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {isCustom ? (
          CUSTOM_TABS[activeKey]
        ) : (
          <>
            <SearchBar value={query} onChange={setQuery} />
            <TabPanel key={activeKey} tab={activeTab} query={query} />
          </>
        )}
      </div>
    </div>
  );
}
