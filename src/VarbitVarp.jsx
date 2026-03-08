import { useState, useMemo } from "react";
import varbitsRaw from "./data/varbit_definitions.json";
import varpsRaw from "./data/varp_definitions.json";

const varbitList = Array.isArray(varbitsRaw) ? varbitsRaw : Object.values(varbitsRaw);
const varpMap = {};
const varpList = Array.isArray(varpsRaw) ? varpsRaw : Object.values(varpsRaw);
for (const v of varpList) varpMap[v.id] = v;

// Group varbits by varp index
const varbitsByVarp = {};
for (const vb of varbitList) {
  const idx = vb.index;
  if (!varbitsByVarp[idx]) varbitsByVarp[idx] = [];
  varbitsByVarp[idx].push(vb);
}

export default function VarbitVarp() {
  const [mode, setMode] = useState("varbit"); // "varbit" | "varp"
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    if (mode === "varbit") {
      return varbitList
        .filter((v) => isNum ? String(v.id) === q || String(v.index) === q : false)
        .slice(0, 200);
    } else {
      return varpList
        .filter((v) => isNum ? String(v.id) === q : false)
        .slice(0, 200);
    }
  }, [query, mode]);

  const linkedVarp = selected?.mode === "varbit"
    ? varpMap[selected.item.index]
    : null;

  const linkedVarbits = selected?.mode === "varp"
    ? (varbitsByVarp[selected.item.id] || [])
    : selected?.mode === "varbit"
    ? (varbitsByVarp[selected.item.index] || []).filter(v => v.id !== selected.item.id)
    : [];

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: "#18181b", border: "1px solid #27272a" }}>
        {["varbit", "varp"].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setQuery(""); setSelected(null); }}
            className={`px-4 py-1.5 rounded text-sm capitalize transition-colors ${
              mode === m ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {m === "varbit" ? "Varbits" : "Varps"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder={mode === "varbit" ? "Search by varbit ID or varp index..." : "Search by varp ID..."}
          className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
        )}
      </div>

      {/* Empty state */}
      {!query.trim() && !selected && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">
            {mode === "varbit"
              ? "Search by varbit ID or varp index — click any result to see the linked varp and sibling varbits"
              : "Search by varp ID — click any result to see all varbits that map to it"}
          </div>
          <div className="text-zinc-700 text-xs mt-1">
            {mode === "varbit"
              ? `${varbitList.length.toLocaleString()} varbits · ${varpList.length.toLocaleString()} varps`
              : `${varpList.length.toLocaleString()} varps`}
          </div>
        </div>
      )}

      {/* Results list */}
      {!selected && query.trim() && (
        results.length === 0 ? (
          <div className="text-zinc-600 text-sm py-6 text-center">No results. Try searching by numeric ID.</div>
        ) : (
          <>
            <div className="text-xs text-zinc-600 mb-2">{results.length} result{results.length !== 1 ? "s" : ""}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {mode === "varbit"
                      ? ["Varbit ID", "Varp Index", "Start Bit", "End Bit"].map(h => (
                          <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider">{h}</th>
                        ))
                      : ["Varp ID", "Type"].map(h => (
                          <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider">{h}</th>
                        ))
                    }
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setSelected({ item, mode })}>
                      {mode === "varbit" ? (
                        <>
                          <td className="py-1.5 pr-6 text-zinc-400">{item.id}</td>
                          <td className="py-1.5 pr-6 text-zinc-100">{item.index}</td>
                          <td className="py-1.5 pr-6 text-zinc-400">{item.startBit}</td>
                          <td className="py-1.5 pr-6 text-zinc-400">{item.endBit}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-1.5 pr-6 text-zinc-400">{item.id}</td>
                          <td className="py-1.5 pr-6 text-zinc-100">{item.type}</td>
                        </>
                      )}
                      <td className="py-1.5 text-zinc-600 text-xs">view →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {/* Detail panel */}
      {selected && (
        <div>
          <button onClick={() => setSelected(null)}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">← Back</button>

          {selected.mode === "varbit" && (
            <>
              {/* Varbit detail */}
              <div className="rounded-lg p-4 mb-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Varbit {selected.item.id}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Varbit ID", value: selected.item.id },
                    { label: "Varp Index", value: selected.item.index },
                    { label: "Start Bit", value: selected.item.startBit },
                    { label: "End Bit", value: selected.item.endBit },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-zinc-600">{label}</div>
                      <div className="text-white font-mono mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked varp */}
              {linkedVarp && (
                <div className="rounded-lg p-4 mb-4" style={{ background: "#18181b", border: "1px solid #3f3f46" }}>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Linked Varp</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-600">Varp ID</div>
                      <div className="text-amber-400 font-mono mt-0.5">{linkedVarp.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-600">Type</div>
                      <div className="text-white font-mono mt-0.5">{linkedVarp.type}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {selected.mode === "varp" && (
            <div className="rounded-lg p-4 mb-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Varp {selected.item.id}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-600">Varp ID</div>
                  <div className="text-white font-mono mt-0.5">{selected.item.id}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">Type</div>
                  <div className="text-white font-mono mt-0.5">{selected.item.type}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sibling varbits */}
          {linkedVarbits.length > 0 && (
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {selected.mode === "varp" ? "All varbits using this varp" : "Other varbits on same varp"}
                <span className="ml-2 text-zinc-700">({linkedVarbits.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {["Varbit ID", "Start Bit", "End Bit"].map(h => (
                        <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {linkedVarbits.map((vb) => (
                      <tr key={vb.id}
                        className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                        onClick={() => setSelected({ item: vb, mode: "varbit" })}>
                        <td className="py-1.5 pr-6 text-zinc-400">{vb.id}</td>
                        <td className="py-1.5 pr-6 text-zinc-100">{vb.startBit}</td>
                        <td className="py-1.5 pr-6 text-zinc-400">{vb.endBit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
