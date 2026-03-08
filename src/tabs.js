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
    // Custom component: Items.jsx
    key: "items",
    label: "Items",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    // Custom component: Npcs.jsx
    key: "npcs",
    label: "NPCs",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
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
    // Custom component: Enums.jsx
    key: "enums",
    label: "Enums",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "identity_kits",
    label: "Identity Kits",
    file: () => import("./data/identity_kit_definitions.json"),
    toRows(data) {
      const BODY_PARTS = {0:"Hair",1:"Beard",2:"Torso",3:"Arms",4:"Hands",5:"Legs",6:"Feet",7:"Female Hair",8:"Female Torso",9:"Female Arms",10:"Female Hands",11:"Female Legs",12:"Female Feet",13:"Female Beard"};
      return data.map((e) => {
        const d = e.definition || e;
        const partId = d.bodyPartId ?? "";
        return {
          id: d.id ?? e.id,
          bodyPart: partId !== "" ? (BODY_PARTS[partId] || `Part ${partId}`) : "",
          bodyPartId: partId,
          modelCount: d.modelIds?.length ?? "",
          headModelCount: (d.headModels || []).filter((x) => x !== -1).length,
        };
      });
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "bodyPart", label: "Body Part" },
      { key: "modelCount", label: "Models" },
      { key: "headModelCount", label: "Head Models" },
    ],
    searchKeys: ["id", "bodyPart"],
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
    // Custom component: WorldMaps.jsx (combines World Maps + World Map Info)
    key: "world_maps",
    label: "World Maps",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
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
        primaryIdle: r.primaryIdle !== -1 ? r.primaryIdle ?? "" : "",
        primaryWalk: r.primaryWalk !== -1 ? r.primaryWalk ?? "" : "",
        run: r.run !== -1 ? r.run ?? "" : "",
        turning: r.turning !== -1 ? r.turning ?? "" : "",
        walkBackwards: r.walkBackwards !== -1 ? r.walkBackwards ?? "" : "",
        sideStepLeft: r.sideStepLeft !== -1 ? r.sideStepLeft ?? "" : "",
        sideStepRight: r.sideStepRight !== -1 ? r.sideStepRight ?? "" : "",
        secondaryWalk: r.secondaryWalk !== -1 ? r.secondaryWalk ?? "" : "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "primaryIdle", label: "Idle" },
      { key: "primaryWalk", label: "Walk" },
      { key: "run", label: "Run" },
      { key: "turning", label: "Turn" },
      { key: "walkBackwards", label: "Walk Back" },
      { key: "sideStepLeft", label: "Step Left" },
      { key: "sideStepRight", label: "Step Right" },
      { key: "secondaryWalk", label: "Walk 2" },
    ],
    searchKeys: ["id", "primaryIdle", "primaryWalk", "run"],
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
