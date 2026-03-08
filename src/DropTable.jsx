import { useState, useMemo } from "react";
import itemsRaw from "./data/item_definitions.json";
import npcsRaw from "./data/npc_definitions.json";
import dropTablesRawFile from "./data/drop_tables.json";
const dropTablesRaw = dropTablesRawFile.tables ?? dropTablesRawFile;

/* ------------------------------------------------ */
/* ITEM LOOKUP                                      */
/* ------------------------------------------------ */

const itemByStringId = {};
for (const item of itemsRaw) {
  if (item.stringId) itemByStringId[item.stringId] = item;
}

/* ------------------------------------------------ */
/* NPC LIST                                         */
/* ------------------------------------------------ */

const npcList = [];
const seenNames = new Set();

for (const npc of npcsRaw) {
  const table = npc?.extras?.drop_table;
  if (!table) continue;

  const key = table + "_drop_table";
  if (!dropTablesRaw[key]) continue;

  if (!seenNames.has(npc.name)) {
    seenNames.add(npc.name);
    npcList.push({ name: npc.name, id: npc.id, tableKey: key });
  }
}

npcList.sort((a, b) => a.name.localeCompare(b.name));

/* ------------------------------------------------ */
/* SUB-TABLE FINGERPRINTING                         */
/* After Jackson dump, named sub-tables are inlined */
/* We identify them by roll + ordered (id, amount)  */
/* ------------------------------------------------ */

const NAMED_SUBTABLES = [
  "rare_drop_table",
  "gem_drop_table",
  "mega_rare_drop_table",
  "herb_drop_table",
  "herb_drop_table_chaos_druid",
  "useful_herb_drop_table",
  "talisman_drop_table",
  "rare_seed_drop_table",
  "uncommon_seed_drop_table",
  "allotment_seed_drop_table",
  "tree_herb_seed_drop_table",
];

function tableFingerprint(node) {
  if (!node?.drops) return null;
  const drops = node.drops
    .filter(d => d.id && d.id !== "nothing")
    .map(d => `${d.id}:${d.amount?.start ?? 1}`)
    .join(",");
  return `${node.roll ?? 1}|${node.type ?? "First"}|${drops}`;
}

// Build fingerprint -> name map at module load time
const fingerprintToName = new Map();
for (const name of NAMED_SUBTABLES) {
  const table = dropTablesRaw[name];
  if (!table) continue;
  const fp = tableFingerprint(table);
  if (fp) fingerprintToName.set(fp, name);
}

function identifyInlineTable(node) {
  return fingerprintToName.get(tableFingerprint(node)) ?? null;
}

/* ------------------------------------------------ */
/* FLATTEN VOID DROP TABLES                         */
/* ------------------------------------------------ */

function flattenTable(node, cumProb = 1, source = "main", depth = 0) {
  if (!node || depth > 20) return [];

  const results = [];
  const type = node.type ?? "First";
  const roll = Math.max(node.roll ?? 1, 1);

  let count = 0;

  for (const drop of node.drops ?? []) {

    const chance = drop.chance ?? 0;
    if (chance === 0) continue;

    const start = count;
    const end = count + chance;
    count = end;

    const window = Math.max(0, Math.min(end, roll) - start);
    const prob = type === "All" ? 1 : window / roll;

    if (prob <= 0) continue;

    const childProb = cumProb * prob;

    /* inline sub-table — check if it's a known named table */
    if (drop.drops) {
      const name = identifyInlineTable(drop);
      results.push(...flattenTable(drop, childProb, name ?? source, depth + 1));
      continue;
    }

    /* referenced table (non-inlined) */
    if (drop.table) {
      const key = drop.table.endsWith("_drop_table")
        ? drop.table
        : drop.table + "_drop_table";
      const table = dropTablesRaw[key] ?? dropTablesRaw[drop.table];
      if (table) {
        results.push(...flattenTable(table, childProb, drop.table, depth + 1));
      }
      continue;
    }

    /* item drop */
    if (!drop.id || drop.id === "nothing") continue;

    const item = itemByStringId[drop.id];
    const amountMin = drop.amount?.start ?? drop.min ?? drop.amount ?? 1;
    const amountMax = drop.amount?.end ?? drop.max ?? drop.amount ?? 1;

    results.push({
      stringId: drop.id,
      name: item?.name ?? drop.id,
      examine: item?.extras?.examine ?? "",
      price: item?.extras?.price ?? 0,
      amountMin,
      amountMax,
      prob: childProb,
      table: source,
      noted: drop.id.endsWith("_noted"),
    });
  }

  return results;
}

/* ------------------------------------------------ */
/* GROUP DROPS                                      */
/* ------------------------------------------------ */

// Maps source table name -> section label (null = main)
const SECTION_LABELS = {
  rare_drop_table:             "Rare drop table",
  gem_drop_table:              "Gem drop table",
  mega_rare_drop_table:        "Mega rare drop table",
  herb_drop_table:             "Herb drop table",
  herb_drop_table_chaos_druid: "Herb drop table",
  useful_herb_drop_table:      "Herb drop table",
  talisman_drop_table:         "Talisman drop table",
  rare_seed_drop_table:        "Seed drop table",
  uncommon_seed_drop_table:    "Seed drop table",
  allotment_seed_drop_table:   "Seed drop table",
  tree_herb_seed_drop_table:   "Seed drop table",
};

// Section display order
const SECTION_ORDER = [
  "always",
  "main",
  "Herb drop table",
  "Seed drop table",
  "Talisman drop table",
  "Rare drop table",
  "Gem drop table",
  "Mega rare drop table",
];

function groupDrops(drops) {
  const groups = {};

  for (const drop of drops) {
    let key;
    if (drop.prob >= 1) {
      key = "always";
    } else {
      key = SECTION_LABELS[drop.table] ?? "main";
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(drop);
  }

  return groups;
}

/* ------------------------------------------------ */
/* DISPLAY HELPERS                                  */
/* ------------------------------------------------ */

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

/* ------------------------------------------------ */
/* DROP SECTION COMPONENT                           */
/* ------------------------------------------------ */

function DropSection({ title, drops }) {
  if (!drops?.length) return null;

  return (
    <div className="mb-6">
      <div className="bg-zinc-800 px-3 py-2 border border-zinc-700 rounded-t text-sm font-semibold text-zinc-300">
        {title}
      </div>
      <table className="w-full text-sm border border-t-0 border-zinc-700 bg-zinc-900">
        <thead>
          <tr className="border-b border-zinc-700 text-xs text-zinc-400">
            <th className="px-3 py-2 text-left">Item</th>
            <th className="px-3 py-2 text-left">Amount</th>
            <th className="px-3 py-2 text-left">Rarity</th>
            <th className="px-3 py-2 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {drops.map((drop, i) => (
            <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800">
              <td className="px-3 py-2 text-zinc-100">
                {drop.name}
                {drop.noted && <span className="ml-1 text-xs text-zinc-500">(noted)</span>}
                {drop.examine && <span className="ml-2 text-xs text-zinc-600 italic">{drop.examine}</span>}
              </td>
              <td className="px-3 py-2 text-zinc-400">
                {drop.amountMin === drop.amountMax ? drop.amountMin : `${drop.amountMin}–${drop.amountMax}`}
              </td>
              <td className="px-3 py-2 font-mono text-xs" style={{ color: rarityColor(drop.prob) }}>
                {rarityLabel(drop.prob)}
              </td>
              <td className="px-3 py-2 text-zinc-500 text-xs">
                {formatGp(drop.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------ */
/* MAIN COMPONENT                                   */
/* ------------------------------------------------ */

export default function DropTable() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return npcList.filter(n => n.name.toLowerCase().includes(q)).slice(0, 80);
  }, [query]);

  const groups = useMemo(() => {
    if (!selected) return null;
    const raw = flattenTable(dropTablesRaw[selected.tableKey]);
    return groupDrops(raw);
  }, [selected]);

  return (
    <div>

      {/* SEARCH */}
      <div className="relative max-w-sm mb-4">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Search NPC name..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
      </div>

      {/* NPC LIST */}
      {!selected && query && (
        <div className="flex flex-wrap gap-2">
          {filtered.map(npc => (
            <button key={npc.id} onClick={() => setSelected(npc)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 hover:border-amber-500 hover:text-amber-400">
              {npc.name}
            </button>
          ))}
        </div>
      )}

      {/* DROP TABLE */}
      {selected && groups && (
        <div className="mt-4">
          <button onClick={() => setSelected(null)}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-3">
            ← Back
          </button>
          <h2 className="text-white font-semibold mb-4">{selected.name}</h2>

          {SECTION_ORDER.map(key => (
            <DropSection
              key={key}
              title={key === "always" ? "Always" : key === "main" ? "Main drops" : key}
              drops={groups[key]}
            />
          ))}

          {/* Any unrecognised sub-tables */}
          {Object.keys(groups)
            .filter(k => !SECTION_ORDER.includes(k))
            .map(k => (
              <DropSection key={k} title={k.replace(/_/g, " ")} drops={groups[k]} />
            ))}
        </div>
      )}

    </div>
  );
}
