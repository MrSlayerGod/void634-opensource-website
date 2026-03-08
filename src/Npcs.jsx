import { useState, useMemo } from "react";
import npcsRaw from "./data/npc_definitions.json";

const ATTACK_STYLES = {
  stab: "Stab", slash: "Slash", crush: "Crush",
  magic: "Magic", ranged: "Ranged", range: "Ranged",
  dragonfire: "Dragonfire", typeless: "Typeless",
};

function StatBar({ value, max = 400, color = "#60a5fa" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-zinc-300 w-8 text-right">{value}</span>
    </div>
  );
}

function BonusCell({ value }) {
  if (!value) return <span className="text-zinc-700">0</span>;
  const color = value > 0 ? "#34d399" : "#f87171";
  return <span style={{ color }}>{value > 0 ? `+${value}` : value}</span>;
}

export default function Npcs() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    return npcsRaw
      .filter((npc) => {
        if (isNum) return String(npc.id) === q;
        const name = (npc.name || "").toLowerCase();
        const sid = (npc.stringId || "").toLowerCase();
        const examine = ((npc.extras || {}).examine || "").toLowerCase();
        return name.includes(q) || sid.includes(q) || examine.includes(q);
      })
      .slice(0, 500);
  }, [query]);

  const ext = selected?.extras || {};

  return (
    <div>
      <div className="relative max-w-sm mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Search by name, ID, or examine text..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
        )}
      </div>

      {!query.trim() && !selected && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">Search NPCs by name, ID, or examine text</div>
          <div className="text-zinc-700 text-xs mt-1">{npcsRaw.length.toLocaleString()} NPCs</div>
        </div>
      )}

      {/* Results list */}
      {!selected && query.trim() && (
        results.length === 0 ? (
          <div className="text-zinc-600 text-sm py-6 text-center">No results found.</div>
        ) : (
          <>
            <div className="text-xs text-zinc-600 mb-2">
              {results.length.toLocaleString()} result{results.length !== 1 ? "s" : ""}
              {results.length === 500 ? " (capped at 500)" : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["ID", "Name", "Level", "HP", "Style", "Max Hit", "Examine"].map((h) => (
                      <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((npc) => {
                    const e = npc.extras || {};
                    return (
                      <tr key={npc.id}
                        className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                        onClick={() => setSelected(npc)}>
                        <td className="py-1.5 pr-6 text-zinc-500">{npc.id}</td>
                        <td className="py-1.5 pr-6 text-zinc-100">{npc.name}</td>
                        <td className="py-1.5 pr-6 text-zinc-400">{npc.average_level || ""}</td>
                        <td className="py-1.5 pr-6 text-zinc-400">{npc.hitpoints || ""}</td>
                        <td className="py-1.5 pr-6 text-zinc-400 capitalize">{e.style ? (ATTACK_STYLES[e.style] || e.style) : ""}</td>
                        <td className="py-1.5 pr-6 text-zinc-400">{e.max_hit_melee || e.max_hit_range || e.max_hit_magic || ""}</td>
                        <td className="py-1.5 text-zinc-500 max-w-xs truncate">{e.examine || ""}</td>
                      </tr>
                    );
                  })}
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

          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <h2 className="text-white text-lg font-semibold">{selected.name}</h2>
            <span className="text-xs text-zinc-600">ID {selected.id}</span>
            {selected.stringId && <span className="text-xs text-zinc-700 font-mono">{selected.stringId}</span>}
          </div>

          {ext.examine && (
            <div className="rounded-lg p-3 mb-5 text-sm text-zinc-400 italic"
              style={{ background: "#18181b", border: "1px solid #27272a" }}>
              "{ext.examine}"
            </div>
          )}

          {/* Combat stats */}
          {(selected.hitpoints > 0 || selected.average_level > 0) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Combat Stats</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HP / levels */}
                <div className="rounded-lg p-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                  <div className="text-xs text-zinc-600 mb-3">Levels</div>
                  {[
                    { label: "Combat Level", value: selected.average_level, max: 1000, color: "#f59e0b" },
                    { label: "Hitpoints", value: selected.hitpoints, max: 30000, color: "#34d399" },
                    { label: "Attack", value: selected.att, max: 400, color: "#60a5fa" },
                    { label: "Strength", value: selected.str, max: 400, color: "#f87171" },
                    { label: "Defence", value: selected.def, max: 400, color: "#a78bfa" },
                  ].filter(({ value }) => value > 0).map(({ label, value, max, color }) => (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-zinc-500">{label}</span>
                      </div>
                      <StatBar value={value} max={max} color={color} />
                    </div>
                  ))}
                </div>

                {/* Attack info */}
                <div className="rounded-lg p-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                  <div className="text-xs text-zinc-600 mb-3">Attack Info</div>
                  {[
                    { label: "Style", value: ext.style ? (ATTACK_STYLES[ext.style] || ext.style) : null },
                    { label: "Attack Speed", value: ext.attack_speed },
                    { label: "Max Hit (Melee)", value: ext.max_hit_melee },
                    { label: "Max Hit (Range)", value: ext.max_hit_range },
                    { label: "Max Hit (Magic)", value: ext.max_hit_magic },
                    { label: "Attack Bonus", value: selected.attack_bonus },
                    { label: "Strength Bonus", value: selected.strength_bonus },
                    { label: "XP Bonus", value: selected.xp_bonus !== 1 ? `×${selected.xp_bonus}` : null },
                  ].filter(({ value }) => value != null && value !== 0 && value !== "").map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">{label}</span>
                      <span className="text-zinc-300 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Defence bonuses */}
          {(ext.stab_defence != null || ext.slash_defence != null) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Defence Bonuses</div>
              <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { key: "stab_defence", label: "Stab" },
                    { key: "slash_defence", label: "Slash" },
                    { key: "crush_defence", label: "Crush" },
                    { key: "magic_defence", label: "Magic" },
                    { key: "range_defence", label: "Ranged" },
                  ].map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-zinc-600">{label}</div>
                      <div className="text-sm mt-0.5"><BonusCell value={ext[key]} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Slayer */}
          {(ext.slayer_level || ext.slayer_xp) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Slayer</div>
              <div className="flex flex-wrap gap-3">
                {ext.slayer_level && (
                  <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    <div className="text-xs text-zinc-600">Required Level</div>
                    <div className="text-amber-400 text-sm mt-0.5">{ext.slayer_level}</div>
                  </div>
                )}
                {ext.slayer_xp && (
                  <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    <div className="text-xs text-zinc-600">XP per Kill</div>
                    <div className="text-green-400 text-sm mt-0.5">{ext.slayer_xp.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {ext.categories?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Categories</div>
              <div className="flex flex-wrap gap-1.5">
                {ext.categories.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-xs text-zinc-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {c.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Misc info */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Respawn Delay", value: ext.respawn_delay ? `${ext.respawn_delay} ticks` : null },
              { label: "Wander Range", value: ext.wander_range },
              { label: "Drop Table", value: ext.drop_table },
              { label: "Summoning Level", value: ext.summoning_pouch_level },
              { label: "Summoning Time", value: ext.summoning_time_minutes ? `${ext.summoning_time_minutes} min` : null },
            ].filter(({ value }) => value != null).map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="text-xs text-zinc-600">{label}</div>
                <div className="text-zinc-300 text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
