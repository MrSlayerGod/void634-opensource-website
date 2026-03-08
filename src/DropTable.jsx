import { useState, useMemo } from "react";
import itemsRaw from "./data/item_definitions.json";
import npcsRaw from "./data/npc_definitions.json";
import dropTablesRaw from "./data/drop_tables.json";

// ── lookups ──────────────────────────────────────────────────────────────────
const itemByStringId = {};
for (const item of itemsRaw) {
  if (item.stringId) itemByStringId[item.stringId] = item;
}

// NPC list with valid drop tables
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

// ── flatten drop table with CORRECT cumulative probability ────────────────────
// Each drop's displayed rarity = probability of it dropping on a single kill.
// For "First" tables: prob of a specific entry = entry.chance / table.roll
// For "All" tables: every entry always happens (prob unchanged)
// Chain multiplications through nested tables.
function flattenTable(node, cumProb = 1.0, depth = 0) {
  if (!node || depth > 15) return [];

  const results = [];
  const tableType = node.type ?? "First";
  const roll = node.roll ?? 1;

  let count = 0;

  for (const drop of node.drops ?? []) {
    const chance = drop.chance ?? 0;
    if (chance <= 0) continue;

    const start = count;
    const end = count + chance;
    count = end;

    // Probability window within the roll range
    const window = Math.max(0, Math.min(end, roll) - start);
    const prob = tableType === "All" ? 1 : window / roll;

    if (prob <= 0) continue;

    const childProb = cumProb * prob;

    // Inline sub-table
    if (drop.drops) {
      results.push(...flattenTable(drop, childProb, depth + 1));
      continue;
    }

    if (drop.id != null) {
      const sid = drop.id;

      // Skip nothing entries
      if (sid === "nothing") continue;

      // Check for referenced drop tables
      const asTableKey = sid.endsWith("_drop_table")
        ? sid
        : sid + "_drop_table";

      if (dropTablesRaw[asTableKey]) {
        results.push(...flattenTable(dropTablesRaw[asTableKey], childProb, depth + 1));
        continue;
      }

      if (dropTablesRaw[sid]) {
        results.push(...flattenTable(dropTablesRaw[sid], childProb, depth + 1));
        continue;
      }

      // Real item
      const item = itemByStringId[sid];
      const amt = drop.amount ?? {};
      const noted = sid.endsWith("_noted");

      results.push({
        stringId: sid,
        name: item?.name ?? sid,
        examine: item?.extras?.examine ?? "",
        price: item?.extras?.price ?? 0,
        amountMin: amt.start ?? 1,
        amountMax: amt.end ?? 1,
        prob: childProb,
        noted,
      });
    }
  }

  return results;
}

// ── display helpers ───────────────────────────────────────────────────────────
function rarityLabel(prob) {
  if (prob >= 1) return "Always";
  const denom = Math.round(1 / prob);
  return `1/${denom.toLocaleString()}`;
}

function rarityColor(prob) {
  if (prob >= 1) return "#22c55e";
  if (prob >= 0.1) return "#a3e635";
  if (prob >= 0.02) return "#facc15";
  if (prob >= 0.005) return "#fb923c";
  return "#f87171";
}

function formatGp(n) {
  if (!n) return "";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
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
    const raw = flattenTable(dropTablesRaw[selected.tableKey]);
    // Sort: always first, then by probability desc
    return raw.sort((a, b) => b.prob - a.prob);
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

      {/* Empty state */}
      {!query.trim() && !selected && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">Search an NPC to view their drop table</div>
          <div className="text-zinc-700 text-xs mt-1">{npcList.length.toLocaleString()} NPCs with drop tables</div>
        </div>
      )}

      {/* NPC buttons */}
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

          <div className="overflow-x-auto border border-zinc-700 rounded bg-zinc-900">
            <table className="w-full text-sm border-collapse bg-zinc-900">
              <thead>
                <tr className="bg-zinc-800 border-b border-zinc-700">
                  {["Item", "Amount", "Rarity", "Price"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drops.map((drop, i) => (
                  <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
                    <td className="px-3 py-2 text-zinc-100 whitespace-nowrap">
                      {drop.name}
                      {drop.noted && <span className="ml-1 text-xs text-zinc-500">(noted)</span>}
                      {drop.examine && (
                        <span className="ml-2 text-zinc-600 text-xs italic">{drop.examine}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                      {drop.amountMin === drop.amountMax
                        ? drop.amountMin
                        : `${drop.amountMin}–${drop.amountMax}`}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-mono text-xs"
                      style={{ color: rarityColor(drop.prob) }}>
                      {rarityLabel(drop.prob)}
                    </td>
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap text-xs">
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
