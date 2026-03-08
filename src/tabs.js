// Each tab defines:
//   key        — unique id
//   label      — display name
//   file       — dynamic JSON import
//   toRows(data) — converts raw JSON to flat array of rows
//   columns    — [{ key, label }] shown in table
//   searchKeys — fields searched against query
//
// Tabs with key in CUSTOM_TABS (App.jsx) skip the generic search and render their own component.

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
    // Custom component: DropTable.jsx
    key: "drop_tables",
    label: "Drop Tables",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "enums",
    label: "Enums",
    file: () => import("./data/enum_definitions.json"),
    toRows(data) {
      return data.map((e) => {
        const d = e.definition || e;
        return {
          id: d.id ?? e.id,
          stringId: d.stringId || "",
          keyType: d.keyType || "",
          valueType: d.valueType || "",
          length: d.length ?? "",
          defaultString: d.defaultString || "",
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "stringId", label: "String ID" },
      { key: "keyType", label: "Key Type" },
      { key: "valueType", label: "Value Type" },
      { key: "length", label: "Length" },
      { key: "defaultString", label: "Default" },
    ],
    searchKeys: ["id", "stringId", "defaultString"],
  },
  {
    key: "identity_kits",
    label: "Identity Kits",
    file: () => import("./data/identity_kit_definitions.json"),
    toRows(data) {
      return data.map((e) => {
        const d = e.definition || e;
        return {
          id: d.id ?? e.id,
          bodyPartId: d.bodyPartId ?? "",
          modelCount: d.modelIds?.length ?? "",
          headModelCount: (d.headModels || []).filter((x) => x !== -1).length,
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "bodyPartId", label: "Body Part" },
      { key: "modelCount", label: "Models" },
      { key: "headModelCount", label: "Head Models" },
    ],
    searchKeys: ["id", "bodyPartId"],
  },
  {
    key: "inventories",
    label: "Inventories",
    file: () => import("./data/inventory_definitions.json"),
    toRows(data) {
      return data.map((inv) => ({
        id: inv.id,
        stringId: inv.stringId || "",
        length: inv.length ?? "",
        hasItems: inv.ids ? "Yes" : "No",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "stringId", label: "String ID" },
      { key: "length", label: "Size" },
      { key: "hasItems", label: "Has Items" },
    ],
    searchKeys: ["id", "stringId"],
  },
  {
    key: "world_maps",
    label: "World Maps",
    file: () => import("./data/world_map_definitions.json"),
    toRows(data) {
      return data.map((e) => {
        const d = e.definition || e;
        return {
          id: d.id ?? e.id,
          name: d.name || "",
          map: d.map || "",
          static: d.static ? "Yes" : "No",
          sections: d.sections?.length ?? "",
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "map", label: "Map Key" },
      { key: "static", label: "Static" },
      { key: "sections", label: "Sections" },
    ],
    searchKeys: ["id", "name", "map"],
  },
  {
    key: "world_map_info",
    label: "World Map Info",
    file: () => import("./data/world_map_info_definitions.json"),
    toRows(data) {
      return data.map((e) => {
        const d = e.definition || e;
        return {
          id: d.id ?? e.id,
          name: d.name || "",
          spriteId: d.spriteId ?? "",
          clientScript: d.clientScript ?? "",
          hidden: d.hiddenOnWorldMap ? "Yes" : "No",
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "spriteId", label: "Sprite ID" },
      { key: "clientScript", label: "Client Script" },
      { key: "hidden", label: "Hidden" },
    ],
    searchKeys: ["id", "name", "spriteId"],
  },
  {
    key: "structs",
    label: "Structs",
    file: () => import("./data/struct_definitions.json"),
    toRows(data) {
      return data.map((e) => {
        const d = e.definition || e;
        return {
          id: d.id ?? e.id,
          stringId: d.stringId || "",
          extraKeys: d.extras ? Object.keys(d.extras).join(", ") : "",
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "stringId", label: "String ID" },
      { key: "extraKeys", label: "Extra Keys" },
    ],
    searchKeys: ["id", "stringId"],
  },
  {
    // Custom component: VarbitVarp.jsx (combines both)
    key: "varbits_varps",
    label: "Varbits / Varps",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    // Custom component: ClientScripts.jsx
    key: "client_scripts",
    label: "Client Scripts",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "graphics",
    label: "Graphics",
    file: () => import("./data/graphic_definitions.json"),
    toRows(data) {
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
    // Custom component: Skeletons.jsx
    key: "skeletons",
    label: "Skeletons",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
];
