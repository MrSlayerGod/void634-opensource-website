// Each tab defines:
//   key        — unique id
//   label      — display name
//   file       — JSON import
//   toRows(data) — converts raw JSON to flat array of { id, cols... }
//   columns    — [{ key, label }] to show in table

export const TABS = [
  {
    key: "items",
    label: "Items",
    file: () => import("./data/item_definitions.json"),
    toRows(data) {
      return data.map((item) => ({
        id: item.id,
        stringId: item.stringId || "",
        name: item.name || "",
        examine: item?.extras?.examine || "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "stringId", label: "String ID" },
      { key: "examine", label: "Examine" },
    ],
    searchKeys: ["id", "name", "stringId", "examine"],
  },
  {
    key: "npcs",
    label: "NPCs",
    file: () => import("./data/npc_definitions.json"),
    toRows(data) {
      return data.map((npc) => ({
        id: npc.id,
        stringId: npc.stringId || "",
        name: npc.name || "",
        examine: npc?.extras?.examine || "",
        level: npc.average_level ?? "",
        hp: npc.hitpoints ?? "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "stringId", label: "String ID" },
      { key: "level", label: "Level" },
      { key: "hp", label: "HP" },
      { key: "examine", label: "Examine" },
    ],
    searchKeys: ["id", "name", "stringId", "examine"],
  },
  {
    key: "objects",
    label: "Objects",
    file: () => import("./data/object_definitions.json"),
    toRows(data) {
      return data.map((obj) => ({
        id: obj.id,
        stringId: obj.stringId || "",
        name: obj.name || "",
        options: (obj.options || []).filter(Boolean).join(", "),
        size: obj.sizeX && obj.sizeY ? `${obj.sizeX}×${obj.sizeY}` : "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "stringId", label: "String ID" },
      { key: "options", label: "Options" },
      { key: "size", label: "Size" },
    ],
    searchKeys: ["id", "name", "stringId", "options"],
  },
  {
    key: "client_scripts",
    label: "Client Scripts",
    file: () => import("./data/client_scripts.json"),
    toRows(data) {
      return data.map((cs) => ({
        id: cs.id,
        instructionCount: cs.instructions?.length ?? 0,
        intOperands: cs.intOperands?.length ?? 0,
        stringOperands: cs.stringOperands?.length ?? 0,
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "instructionCount", label: "Instructions" },
      { key: "intOperands", label: "Int Operands" },
      { key: "stringOperands", label: "String Operands" },
    ],
    searchKeys: ["id"],
  },
  {
    key: "graphics",
    label: "Graphics",
    file: () => import("./data/graphic_definitions.json"),
    toRows(data) {
      // data is an object keyed by id string
      const arr = Array.isArray(data) ? data : Object.values(data);
      return arr.map((g) => ({
        id: g.id,
        stringId: g.stringId || "",
        modelId: g.modelId ?? "",
        animationId: g.animationId ?? "",
        sizeXY: g.sizeXY ?? "",
        sizeZ: g.sizeZ ?? "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "stringId", label: "String ID" },
      { key: "modelId", label: "Model ID" },
      { key: "animationId", label: "Anim ID" },
      { key: "sizeXY", label: "Size XY" },
      { key: "sizeZ", label: "Size Z" },
    ],
    searchKeys: ["id", "stringId", "modelId", "animationId"],
  },
  {
    key: "varbits",
    label: "Varbits",
    file: () => import("./data/varbit_definitions.json"),
    toRows(data) {
      const arr = Array.isArray(data) ? data : Object.values(data);
      return arr.map((v) => ({
        id: v.id,
        index: v.index ?? "",
        startBit: v.startBit ?? "",
        endBit: v.endBit ?? "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "index", label: "Varp Index" },
      { key: "startBit", label: "Start Bit" },
      { key: "endBit", label: "End Bit" },
    ],
    searchKeys: ["id", "index"],
  },
  {
    key: "structs",
    label: "Structs",
    file: () => import("./data/struct_definitions.json"),
    toRows(data) {
      const arr = Array.isArray(data) ? data : Object.values(data);
      return arr.map((s) => ({
        id: s.id,
        stringId: s.stringId || "",
        extraKeys: s.extras ? Object.keys(s.extras).join(", ") : "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "stringId", label: "String ID" },
      { key: "extraKeys", label: "Extra Keys" },
    ],
    searchKeys: ["id", "stringId"],
  },
  {
    key: "render_anims",
    label: "Render Anims",
    file: () => import("./data/render_animation_definitions.json"),
    toRows(data) {
      const arr = Array.isArray(data) ? data : Object.values(data);
      return arr.map((r) => ({
        id: r.id,
        primaryIdle: r.primaryIdle ?? "",
        primaryWalk: r.primaryWalk ?? "",
        run: r.run ?? "",
        turning: r.turning ?? "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "primaryIdle", label: "Idle Anim" },
      { key: "primaryWalk", label: "Walk Anim" },
      { key: "run", label: "Run Anim" },
      { key: "turning", label: "Turn Anim" },
    ],
    searchKeys: ["id", "primaryIdle", "primaryWalk"],
  },
  {
    key: "skeletons",
    label: "Skeletons",
    file: () => import("./data/animation_skeletons.json"),
    toRows(data) {
      return data.map((s) => ({
        id: s.id,
        animCount: s.anims?.length ?? 0,
        npcCount: s.npcs?.length ?? 0,
        graphicCount: s.graphics?.length ?? 0,
        objectCount: s.objects?.length ?? 0,
        npcNames: (s.npcs || [])
          .slice(0, 3)
          .map((n) => n.name)
          .join(", "),
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "animCount", label: "Anims" },
      { key: "npcCount", label: "NPCs" },
      { key: "graphicCount", label: "Graphics" },
      { key: "objectCount", label: "Objects" },
      { key: "npcNames", label: "NPC Names (sample)" },
    ],
    searchKeys: ["id", "npcNames"],
  },
];
