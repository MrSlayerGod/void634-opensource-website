import { useState, useMemo } from "react";
import itemsRaw from "./data/item_definitions.json";

const BONUS_KEYS = [
  { key: "stab_attack", label: "Stab" },
  { key: "slash_attack", label: "Slash" },
  { key: "crush_attack", label: "Crush" },
  { key: "magic_attack", label: "Magic" },
  { key: "range_attack", label: "Ranged" },
];
const DEFENCE_KEYS = [
  { key: "stab_defence", label: "Stab" },
  { key: "slash_defence", label: "Slash" },
  { key: "crush_defence", label: "Crush" },
  { key: "magic_defence", label: "Magic" },
  { key: "range_defence", label: "Ranged" },
];
const OTHER_BONUS_KEYS = [
  { key: "strength", label: "Strength" },
  { key: "prayer_bonus", label: "Prayer" },
];

function formatPrice(p) {
  if (!p) return null;
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}M gp`;
  if (p >= 1_000) return `${(p / 1_000).toFixed(1)}K gp`;
  return `${p} gp`;
}

function BonusCell({ value }) {
  if (value === undefined || value === null || value === 0) return <span className="text-zinc-700">0</span>;
  const color = value > 0 ? "#34d399" : "#f87171";
  return <span style={{ color }}>{value > 0 ? `+${value}` : value}</span>;
}

export default function Items() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    return itemsRaw
      .filter((item) => {
        if (isNum) return String(item.id) === q;
        const name = (item.name || "").toLowerCase();
        const sid = (item.stringId || "").toLowerCase();
        const examine = ((item.extras || {}).examine || "").toLowerCase();
        const akas = ((item.extras || {}).aka || []).join(" ").toLowerCase();
        return name.includes(q) || sid.includes(q) || examine.includes(q) || akas.includes(q);
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
          <div className="text-zinc-600 text-sm">Search items by name, ID, examine text, or AKA</div>
          <div className="text-zinc-700 text-xs mt-1">{itemsRaw.length.toLocaleString()} items</div>
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
                    {["ID", "Name", "String ID", "Slot", "Price", "Examine"].map((h) => (
                      <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr key={item.id}
                      className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setSelected(item)}>
                      <td className="py-1.5 pr-6 text-zinc-500">{item.id}</td>
                      <td className="py-1.5 pr-6 text-zinc-100">{item.name}</td>
                      <td className="py-1.5 pr-6 text-zinc-500 text-xs">{item.stringId}</td>
                      <td className="py-1.5 pr-6 text-zinc-400">{(item.extras || {}).slot || ""}</td>
                      <td className="py-1.5 pr-6 text-amber-400 whitespace-nowrap">{formatPrice((item.extras || {}).price)}</td>
                      <td className="py-1.5 text-zinc-500 max-w-xs truncate">{(item.extras || {}).examine || ""}</td>
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

          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <h2 className="text-white text-lg font-semibold">{selected.name}</h2>
            <span className="text-xs text-zinc-600">ID {selected.id}</span>
            {selected.stringId && <span className="text-xs text-zinc-700 font-mono">{selected.stringId}</span>}
          </div>

          {/* Primary info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Slot", value: ext.slot || "—" },
              { label: "Price", value: formatPrice(ext.price) || "—" },
              { label: "Weight", value: ext.weight != null ? `${ext.weight} kg` : "—" },
              { label: "Kept on death", value: ext.kept || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="text-xs text-zinc-600">{label}</div>
                <div className="text-white mt-0.5 text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* Examine */}
          {ext.examine && (
            <div className="rounded-lg p-3 mb-5 text-sm text-zinc-400 italic"
              style={{ background: "#18181b", border: "1px solid #27272a" }}>
              "{ext.examine}"
            </div>
          )}

          {/* Equip requirements */}
          {ext.equip_req && Object.keys(ext.equip_req).length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Equip Requirements</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ext.equip_req).map(([skill, level]) => (
                  <span key={skill} className="px-3 py-1 rounded text-sm text-amber-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {skill} {level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Combat bonuses */}
          {[...BONUS_KEYS, ...DEFENCE_KEYS, ...OTHER_BONUS_KEYS].some(({ key }) => ext[key] != null) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Combat Bonuses</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Attack */}
                <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                  <div className="text-xs text-zinc-600 mb-2">Attack Bonuses</div>
                  {BONUS_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">{label}</span>
                      <BonusCell value={ext[key]} />
                    </div>
                  ))}
                </div>
                {/* Defence */}
                <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                  <div className="text-xs text-zinc-600 mb-2">Defence Bonuses</div>
                  {DEFENCE_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">{label}</span>
                      <BonusCell value={ext[key]} />
                    </div>
                  ))}
                </div>
                {/* Other */}
                <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                  <div className="text-xs text-zinc-600 mb-2">Other</div>
                  {OTHER_BONUS_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">{label}</span>
                      <BonusCell value={ext[key]} />
                    </div>
                  ))}
                  {ext.attack_speed != null && (
                    <div className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">Speed</span>
                      <span className="text-zinc-300">{ext.attack_speed}</span>
                    </div>
                  )}
                  {ext.weapon_type && (
                    <div className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-500">Type</span>
                      <span className="text-zinc-300">{ext.weapon_type.replace(/_/g, " ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Special attack */}
          {ext.special && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Special Attack</div>
              <div className="rounded-lg p-3 flex flex-wrap gap-4" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div>
                  <div className="text-xs text-zinc-600">Name</div>
                  <div className="text-white text-sm capitalize mt-0.5">{ext.special.replace(/_/g, " ")}</div>
                </div>
                {ext.special_energy && (
                  <div>
                    <div className="text-xs text-zinc-600">Energy Cost</div>
                    <div className="text-white text-sm mt-0.5">{ext.special_energy / 10}%</div>
                  </div>
                )}
                {ext.special_accuracy_mod && (
                  <div>
                    <div className="text-xs text-zinc-600">Accuracy Mod</div>
                    <div className="text-white text-sm mt-0.5">×{ext.special_accuracy_mod.toFixed(2)}</div>
                  </div>
                )}
                {ext.special_damage_mod_1 && (
                  <div>
                    <div className="text-xs text-zinc-600">Damage Mod</div>
                    <div className="text-white text-sm mt-0.5">×{ext.special_damage_mod_1.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AKAs */}
          {ext.aka?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Also Known As</div>
              <div className="flex flex-wrap gap-1.5">
                {ext.aka.map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded text-xs font-mono text-zinc-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {a}
                  </span>
                ))}
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

          {/* Limit/trade info */}
          {(ext.limit != null || ext.destroy) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Trade / Death</div>
              <div className="flex flex-wrap gap-3">
                {ext.limit != null && (
                  <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    <div className="text-xs text-zinc-600">Trade Limit</div>
                    <div className="text-white text-sm mt-0.5">{ext.limit}</div>
                  </div>
                )}
                {ext.destroy && (
                  <div className="rounded-lg p-3" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    <div className="text-xs text-zinc-600">Destroy Message</div>
                    <div className="text-zinc-300 text-sm mt-0.5">{ext.destroy}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
