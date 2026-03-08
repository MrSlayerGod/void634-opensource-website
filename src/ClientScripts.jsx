import { useState, useMemo } from "react";
import scriptsRaw from "./data/client_scripts.json";

// Strip RS colour tags like <col=000080> and </col>
function stripTags(s) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, "").trim();
}

// Build a human-readable "preview" from string operands
function buildPreview(script) {
  const strs = (script.stringOperands || []).filter(Boolean).map(stripTags).filter(Boolean);
  if (strs.length > 0) return strs.slice(0, 6).join(" · ");
  return null;
}

// Pre-process all scripts into searchable rows
const scriptRows = scriptsRaw.map((s) => ({
  id: s.id,
  instructionCount: s.instructions?.length ?? 0,
  intOperandCount: s.intOperands?.length ?? 0,
  stringOperandCount: (s.stringOperands || []).filter(Boolean).length,
  preview: buildPreview(s),
  raw: s,
}));

export default function ClientScripts() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    return scriptRows
      .filter((s) => {
        if (isNum) return String(s.id) === q;
        return s.preview && s.preview.toLowerCase().includes(q);
      })
      .slice(0, 200);
  }, [query]);

  const script = selected?.raw;

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
          placeholder="Search by script ID or text content..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
        )}
      </div>
      <div className="text-xs text-zinc-700 mb-4 ml-1">
        Tip: search by ID for any script, or by text content (e.g. "garden", "butler") for scripts with readable strings
      </div>

      {/* Empty state */}
      {!query.trim() && !selected && (
        <div className="py-20 text-center">
          <div className="text-zinc-600 text-sm">Search client scripts by ID or readable text content</div>
          <div className="text-zinc-700 text-xs mt-1">
            {scriptsRaw.length.toLocaleString()} scripts · {scriptRows.filter(s => s.preview).length.toLocaleString()} with readable text
          </div>
        </div>
      )}

      {/* Results */}
      {!selected && query.trim() && (
        results.length === 0 ? (
          <div className="text-zinc-600 text-sm py-6 text-center">No results found.</div>
        ) : (
          <>
            <div className="text-xs text-zinc-600 mb-2">{results.length} result{results.length !== 1 ? "s" : ""}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["ID", "Instructions", "Text Content"].map(h => (
                      <th key={h} className="text-left pb-2 pr-6 text-zinc-500 font-normal text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((s) => (
                    <tr key={s.id}
                      className="border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setSelected(s)}>
                      <td className="py-1.5 pr-6 text-zinc-400 whitespace-nowrap">{s.id}</td>
                      <td className="py-1.5 pr-6 text-zinc-400 whitespace-nowrap">{s.instructionCount}</td>
                      <td className="py-1.5 text-zinc-300 max-w-md truncate">{s.preview || <span className="text-zinc-700 italic">no text</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {/* Detail panel */}
      {selected && script && (
        <div>
          <button onClick={() => setSelected(null)}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">← Back</button>

          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-white font-semibold">Script {script.id}</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Instructions", value: script.instructions?.length ?? 0, color: "#a78bfa" },
              { label: "Int Operands", value: script.intOperands?.length ?? 0, color: "#60a5fa" },
              { label: "String Operands", value: (script.stringOperands || []).filter(Boolean).length, color: "#34d399" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Readable string operands */}
          {(script.stringOperands || []).some(Boolean) && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">String Operands (readable)</div>
              <div className="rounded-lg p-3 space-y-1" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                {script.stringOperands.map((s, i) => s ? (
                  <div key={i} className="text-sm text-zinc-300">
                    <span className="text-zinc-600 font-mono text-xs mr-2">[{i}]</span>
                    {stripTags(s)}
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Int operands */}
          {script.intOperands?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Int Operands</div>
              <div className="flex flex-wrap gap-1.5">
                {script.intOperands.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs font-mono text-blue-400"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Opcodes */}
          {script.instructions?.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                Opcodes
                <span className="ml-2 text-zinc-700">({script.instructions.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {script.instructions.map((op, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs font-mono text-zinc-500"
                    style={{ background: "#18181b", border: "1px solid #27272a" }}>
                    {op}
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
