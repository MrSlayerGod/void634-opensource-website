import { useState, useMemo } from "react";
import enumsRaw from "./data/enum_definitions.json";
import itemsRaw from "./data/item_definitions.json";
import npcsRaw from "./data/npc_definitions.json";
import objectsRaw from "./data/object_definitions.json";

// Lookups for resolving IDs
const itemById = {};
for (const i of itemsRaw) itemById[i.id] = i.name;
const npcById = {};
for (const n of npcsRaw) npcById[n.id] = n.name;
const objById = {};
for (const o of objectsRaw) objById[o.id] = o.name;

const KEY_LABELS = { i: "int", I: "int", o: "item", n: "npc", O: "object", K: "kit", z: "coord", S: "string", v: "varbit" };
const VAL_LABELS = { i: "int", I: "int", s: "string", o: "item", O: "object", J: "struct", g: "graphic", c: "coord", K: "kit", d: "npc", v: "varbit" };

function resolveKey(k, keyType) {
  const id = parseInt(k);
  if (keyType === "o") return itemById[id] ? `${itemById[id]} (${id})` : k;
  if (keyType === "n") return npcById[id] ? `${npcById[id]} (${id})` : k;
  if (keyType === "O") return objById[id] ? `${objById[id]} (${id})` : k;
  return k;
}

function resolveVal(v, valType) {
  const id = parseInt(v);
  if (valType === "o" && itemById[id]) return `${itemById[id]} (${id})`;
  if (valType === "d" && npcById[id]) return `${npcById[id]} (${id})`;
  if (valType === "O" && objById[id]) return `${objById[id]} (${id})`;
  return String(v);
}

// Only keep enums that have a map or stringId — filter the 2569 empty ones
const usefulEnums = enumsRaw
  .map((e) => e.definition || e)
  .filter((d) => d.map || d.stringId)
  .map((d) => {
    const entries = d.map ? Object.entries(d.map) : [];
    const resolvedEntries = entries.map(([k, v]) => ({
      rawKey: k,
      rawVal: String(v),
      displayKey: resolveKey(k, d.keyType),
      displayVal: resolveVal(v, d.valueType),
    }));
    // Build searchable text from all resolved values
    const searchText = [
      d.stringId,
      ...resolvedEntries.map((e) => e.displayKey),
      ...resolvedEntries.map((e) => e.displayVal),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return {
      id: d.id,
      stringId: d.stringId || "",
      keyType: d.keyType || "",
      valueType: d.valueType || "",
      keyLabel: KEY_LABELS[d.keyType] || d.keyType || "?",
      valLabel: VAL_LABELS[d.valueType] || d.valueType || "?",
      length: d.length ?? entries.length,
      entries: resolvedEntries,
      searchText,
    };
  });

export default function Enums() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    return usefulEnums
      .filter((e) => {
        if (isNum) return String(e.id) === q;
        return e.searchText.includes(q);
      })
      .slice(0, 200);
  }, [query]);

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-sm mb-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Search by ID, name, or value..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
        )}
      </div>
      <div className="text-xs text-zinc-700 mb-4 ml-1">
        Search by enum name, item name, NPC name, or any string value — e.g. "rune", "dragon", "items_lost_on_death"
      </div>

      {/* Empty state */}
      {!query.trim() && !selected && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">Search enums by name or any resolved value</div>
          <div className="text-zinc-700 text-xs mt-1">{usefulEnums.length.toLocaleString()} enums with data</div>
        </div>
      )}

      {/* Results list */}
      {!selected && query.trim() && (
        results.length === 0 ? (
          <div className="text-zinc-600 text-sm py-6 text-center">No results found.</div>
        ) : (
          <>
            <div className="text-xs text-zinc-600 mb-2">
              {results.length} result{results.length !== 1 ? "s" : ""}
              {results.length === 200 ? " (capped at 200)" : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["ID", "String ID", "Key Type", "Value Type", "Entries"].map((h) => (
                      <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((e) => (
                    <tr key={e.id}
                      className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setSelected(e)}>
                      <td className="py-1.5 pr-6 text-zinc-500">{e.id}</td>
                      <td className="py-1.5 pr-6 text-zinc-100">{e.stringId || <span className="text-zinc-600 italic">unnamed</span>}</td>
                      <td className="py-1.5 pr-6 text-zinc-400">{e.keyLabel}</td>
                      <td className="py-1.5 pr-6 text-zinc-400">{e.valLabel}</td>
                      <td className="py-1.5 text-zinc-400">{e.length}</td>
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

          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-white font-semibold">{selected.stringId || `Enum ${selected.id}`}</h2>
            <span className="text-xs text-zinc-600">ID {selected.id}</span>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Key Type", value: `${selected.keyLabel} (${selected.keyType})`, color: "#60a5fa" },
              { label: "Value Type", value: `${selected.valLabel} (${selected.valueType})`, color: "#a78bfa" },
              { label: "Entries", value: selected.length, color: "#34d399" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Map entries */}
          {selected.entries.length > 0 && (
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Map</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider">Key ({selected.keyLabel})</th>
                      <th className="text-left pb-2 text-zinc-500 font-normal text-xs uppercase tracking-wider">Value ({selected.valLabel})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.entries.map((entry, i) => (
                      <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors">
                        <td className="py-1.5 pr-6 text-zinc-400 whitespace-nowrap">{entry.displayKey}</td>
                        <td className="py-1.5 text-zinc-100 whitespace-nowrap">{entry.displayVal}</td>
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
