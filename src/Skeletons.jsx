import { useState, useMemo } from "react";
import skeletonsRaw from "./data/animation_skeletons.json";

// Build NPC name -> skeleton index
const npcToSkel = {};
for (const skel of skeletonsRaw) {
  for (const npc of (skel.npcs || [])) {
    const name = npc?.name;
    if (name && name !== "null" && !npcToSkel[name]) {
      npcToSkel[name] = skel;
    }
  }
}

// Unique NPC names sorted
const npcNames = Object.keys(npcToSkel).sort();

export default function Skeletons() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // { npcName, skel }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return npcNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 80);
  }, [query]);

  const skel = selected?.skel;

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">🔍</span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Search NPC name..."
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
          <div className="text-zinc-600 text-sm">Search an NPC to view their animation skeleton</div>
          <div className="text-zinc-700 text-xs mt-1">{npcNames.length.toLocaleString()} NPCs with skeletons</div>
        </div>
      )}

      {/* NPC buttons */}
      {!selected && query.trim() && (
        results.length === 0 ? (
          <div className="text-zinc-600 text-sm py-6 text-center">No NPCs found.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.map((name) => (
              <button key={name}
                onClick={() => setSelected({ npcName: name, skel: npcToSkel[name] })}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors">
                {name}
              </button>
            ))}
          </div>
        )
      )}

      {/* Skeleton detail */}
      {selected && skel && (
        <div>
          <button onClick={() => setSelected(null)}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">← Back</button>

          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-white font-semibold">{selected.npcName}</h2>
            <span className="text-xs text-zinc-600">Skeleton ID {skel.id}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Animations", value: skel.anims?.length ?? 0, color: "#a78bfa" },
              { label: "NPCs", value: skel.npcs?.length ?? 0, color: "#34d399" },
              { label: "Graphics", value: skel.graphics?.length ?? 0, color: "#60a5fa" },
              { label: "Objects", value: skel.objects?.length ?? 0, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Animation IDs */}
          {skel.anims?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Animation IDs
                <span className="ml-2 text-zinc-700">({skel.anims.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skel.anims.map((animId) => (
                  <span key={animId}
                    className="px-2 py-0.5 rounded text-xs font-mono text-zinc-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {animId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared NPCs */}
          {skel.npcs?.length > 1 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                NPCs sharing this skeleton
                <span className="ml-2 text-zinc-700">({skel.npcs.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skel.npcs
                  .filter((n) => n?.name && n.name !== "null")
                  .map((n) => (
                    <button key={n.id}
                      onClick={() => setSelected({ npcName: n.name, skel })}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        n.name === selected.npcName
                          ? "bg-zinc-700 text-white border border-zinc-500"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                      }`}>
                      {n.name} <span className="text-zinc-600">#{n.id}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Graphics */}
          {skel.graphics?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Graphic IDs
                <span className="ml-2 text-zinc-700">({skel.graphics.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skel.graphics.map((gid) => (
                  <span key={gid}
                    className="px-2 py-0.5 rounded text-xs font-mono text-blue-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {gid}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Objects */}
          {skel.objects?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Objects
                <span className="ml-2 text-zinc-700">({skel.objects.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skel.objects
                  .filter((o) => o?.name && o.name !== "null")
                  .map((o) => (
                    <span key={o.id}
                      className="px-2.5 py-1 rounded text-xs text-amber-400"
                      style={{ background: "#18181b", border: "1px solid #27272a" }}>
                      {o.name} <span className="text-zinc-600">#{o.id}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
