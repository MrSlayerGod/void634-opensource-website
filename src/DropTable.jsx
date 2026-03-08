import { useState, useMemo } from "react";
import itemsRaw from "./data/item_definitions.json";
import npcsRaw from "./data/npc_definitions.json";
import dropTablesRaw from "./data/drop_tables.json";

// ── lookups ──────────────────────────────────────────────────────────────────
const itemByStringId = {};
for (const item of itemsRaw) {
  if (item.stringId) itemByStringId[item.stringId] = item;
}

// NPC list with valid drop tables (deduplicated by name, keep unique names)
const npcList = [];
const seenNames = new Set();
for (const npc of npcsRaw) {
  const dtVal = npc?.extras?.drop_table;
  if (!dtVal) continue;
  const key = dtVal + "_drop_table";
  if (!dropTablesRaw[key]) continue;
  if (!seenNames.has(npc.name)) {
    seenNames.add(npc.name);
    npcList.push({ name: npc.name, tableKey: key, id: npc.id });
  }
}
npcList.sort((a, b) => a.name.localeCompare(b.name));

// ── flatten drop table recursively ───────────────────────────────────────────
function flattenTable(node, parentRoll = 1, parentType = "All", depth = 0) {
  if (depth > 12) return [];
  const results = [];

  if (node.drops) {
    const roll = node.roll ?? 1;
    const type = node.type ?? "All";
    for (const drop of node.drops) {
      results.push(...flattenTable(drop, roll, type, depth + 1));
    }
  } else if (node.id != null) {
    const sid = node.id;
    // sub-table reference
    if (dropTablesRaw[sid]) {
      results.push(...flattenTable(dropTablesRaw[sid], parentRoll, parentType, depth + 1));
      return results;
    }
    const item = itemByStringId[sid];
    const amt = node.amount ?? {};
    const min = amt.start ?? 1;
    const max = amt.end ?? 1;
    const chance = node.chance ?? 1;
    results.push({
      stringId: sid,
      name: item?.name ?? sid,
      examine: item?.extras?.examine ?? "",
      price: item?.extras?.price ?? 0,
      amountMin: min,
      amountMax: max,
      chance,
      roll: parentRoll,
      type: parentType,
    });
  }
  return results;
}

function rarityLabel(chance, roll) {
  if (roll <= 1) return "Always";
  const frac = chance / roll;
  if (frac >= 1) return "Always";
  const denom = Math.round(roll / chance);
  return `1/${denom}`;
}

function rarityColor(chance, roll) {
  if (roll <= 1 || chance >= roll) return "#22c55e";
  const frac = chance / roll;
  if (frac >= 0.1) return "#a3e635";
  if (frac >= 0.02) return "#facc15";
  if (frac >= 0.005) return "#fb923c";
  return "#f87171";
}

function formatGp(n) {
  if (!n) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── component ─────────────────────────────────────────────────────────────────
export default function DropTable() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return npcList.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 80);
  }, [query]);

  const drops = useMemo(() => {
    if (!selected) return [];
    return flattenTable(dropTablesRaw[selected.tableKey]);
  }, [selected]);

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
          <button
            onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm"
          >✕</button>
        )}
      </div>

      {/* NPC results list */}
      {!selected && query.trim() && (
        <div className="mb-4">
          {filtered.length === 0 ? (
            <div className="text-zinc-600 text-sm py-4 text-center">No NPCs found.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => setSelected(npc)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                >
                  {npc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query.trim() && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">Search an NPC to view their drop table</div>
          <div className="text-zinc-700 text-xs mt-1">{npcList.length.toLocaleString()} NPCs with drop tables</div>
        </div>
      )}

      {/* Drop table */}
      {selected && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >← Back</button>
            <h2 className="text-white font-semibold">{selected.name}</h2>
            <span className="text-xs text-zinc-600">{drops.length} drops</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Item", "Amount", "Rarity", "Price"].map((h) => (
                    <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drops.map((drop, i) => (
                  <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors">
                    <td className="py-1.5 pr-6 text-zinc-100 whitespace-nowrap">
                      {drop.name}
                      {drop.examine && (
                        <span className="ml-2 text-zinc-600 text-xs italic">{drop.examine}</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-6 text-zinc-400 whitespace-nowrap">
                      {drop.amountMin === drop.amountMax
                        ? drop.amountMin
                        : `${drop.amountMin}–${drop.amountMax}`}
                    </td>
                    <td className="py-1.5 pr-6 whitespace-nowrap font-mono text-xs"
                      style={{ color: rarityColor(drop.chance, drop.roll) }}>
                      {rarityLabel(drop.chance, drop.roll)}
                    </td>
                    <td className="py-1.5 text-zinc-500 whitespace-nowrap text-xs">
                      {formatGp(drop.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
