import { useState } from "react";
import worldMapsRaw from "./data/world_map_definitions.json";
import worldMapInfoRaw from "./data/world_map_info_definitions.json";

const maps = worldMapsRaw.map((e) => e.definition || e);

// Group world map info by name, filter unnamed/hidden
const infoByName = {};
for (const e of worldMapInfoRaw) {
  const d = e.definition || e;
  if (d.name && !d.hiddenOnWorldMap) {
    if (!infoByName[d.name]) infoByName[d.name] = [];
    infoByName[d.name].push(d);
  }
}

export default function WorldMaps() {
  const [selected, setSelected] = useState(null);
  const [infoQuery, setInfoQuery] = useState("");

  // Filter world map info labels
  const filteredInfo = worldMapInfoRaw
    .map((e) => e.definition || e)
    .filter((d) => {
      if (!d.name) return false;
      const q = infoQuery.trim().toLowerCase();
      if (!q) return true;
      return d.name.toLowerCase().includes(q);
    })
    .slice(0, 300);

  return (
    <div>
      {/* Two sections: World Maps (small list) + World Map Info (searchable) */}
      <div className="mb-8">
        <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
          World Maps <span className="text-zinc-700 ml-1">({maps.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                {["ID", "Name", "Map Key", "Static", "Sections"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maps.map((m) => (
                <tr key={m.id}
                  className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                  onClick={() => setSelected(selected?.id === m.id ? null : m)}>
                  <td className="py-1.5 pr-6 text-zinc-500">{m.id}</td>
                  <td className="py-1.5 pr-6 text-zinc-100">{m.name}</td>
                  <td className="py-1.5 pr-6 text-zinc-400 font-mono text-xs">{m.map}</td>
                  <td className="py-1.5 pr-6 text-zinc-400">{m.static ? "Yes" : "No"}</td>
                  <td className="py-1.5 text-zinc-400">{m.sections?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sections panel */}
        {selected && (
          <div className="mt-3 rounded-lg p-4" style={{ background: "#18181b", border: "1px solid #3f3f46" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-white font-semibold">{selected.name} — Sections</div>
              <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400 text-sm">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Level", "Min X", "Min Y", "Max X", "Max Y"].map((h) => (
                      <th key={h} className="text-left pb-1.5 pr-4 text-zinc-600 font-normal uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selected.sections || []).map((s, i) => (
                    <tr key={i} className="border-b border-zinc-900">
                      <td className="py-1 pr-4 text-zinc-400">{s.level}</td>
                      <td className="py-1 pr-4 text-zinc-300">{s.minX}</td>
                      <td className="py-1 pr-4 text-zinc-300">{s.minY}</td>
                      <td className="py-1 pr-4 text-zinc-300">{s.maxX}</td>
                      <td className="py-1 text-zinc-300">{s.maxY}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* World Map Info - searchable labels/icons */}
      <div>
        <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
          World Map Info (labels & icons) <span className="text-zinc-700 ml-1">({worldMapInfoRaw.length} total)</span>
        </h2>
        <div className="relative max-w-sm mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
          <input
            type="text"
            value={infoQuery}
            onChange={(e) => setInfoQuery(e.target.value)}
            placeholder="Filter by name..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
          />
          {infoQuery && (
            <button onClick={() => setInfoQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
          )}
        </div>
        <div className="text-xs text-zinc-600 mb-2">
          {filteredInfo.length.toLocaleString()} named entries
          {infoQuery && ` matching "${infoQuery}"`}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                {["ID", "Name", "Sprite ID", "Client Script", "Varbit", "Varp", "Hidden"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInfo.map((d) => (
                <tr key={d.id} className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors">
                  <td className="py-1.5 pr-6 text-zinc-500">{d.id}</td>
                  <td className="py-1.5 pr-6 text-zinc-100">{d.name?.replace(/<br>/g, " ")}</td>
                  <td className="py-1.5 pr-6 text-zinc-400">{d.spriteId >= 0 ? d.spriteId : ""}</td>
                  <td className="py-1.5 pr-6 text-zinc-400">{d.clientScript >= 0 ? d.clientScript : ""}</td>
                  <td className="py-1.5 pr-6 text-zinc-400">{d.varbit >= 0 ? d.varbit : ""}</td>
                  <td className="py-1.5 pr-6 text-zinc-400">{d.varp >= 0 ? d.varp : ""}</td>
                  <td className="py-1.5 text-zinc-400">{d.hiddenOnWorldMap ? "Yes" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
