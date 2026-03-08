// Each tab defines:
//   key        — unique id
//   label      — display name
//   desc       — tooltip shown on hover
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
    desc: "Search all items in the game — weapons, armour, consumables and more. Shows combat bonuses, equip requirements, GE price, examine text and special attack info.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "npcs",
    label: "NPCs",
    desc: "Search all NPCs (non-player characters) — monsters, quest characters, and bosses. Shows combat stats, attack style, max hits, slayer info and drop table key.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "objects",
    label: "Objects",
    desc: "All interactable objects in the game world — doors, chests, trees, rocks, furnaces and anything else you can click on.",
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
    key: "drop_tables",
    label: "Drop Tables",
    desc: "Look up what items any NPC drops when killed, with exact drop rates. Groups drops by type — always drops, main table, rare drop table, herb table, seed table and more.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "enums",
    label: "Enums",
    desc: "Enums are lookup tables used by the client to map one value to another — for example mapping an item ID to a config value, or a string key to a number. Used heavily in interfaces and scripts.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "identity_kits",
    label: "Identity Kits",
    desc: "The models used for character customisation — hair styles, beards, torso shapes, arms, legs and feet for both male and female characters.",
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
    desc: "Inventory container definitions — the backpack, bank, worn equipment, and other containers used to hold items.",
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
    desc: "World map region definitions — the areas shown on the in-game world map, including their coordinates, sections and any conditions required to display them.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "structs",
    label: "Structs",
    desc: "Structs are generic data containers used by the cache to attach extra parameters to game entities. Often used to store config values referenced by client scripts.",
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
    key: "varbits_varps",
    label: "Varbits / Varps",
    desc: "Variables stored on the player. Varps (variable player) are the raw storage slots. Varbits are sub-divisions of a varp, reading specific bits. Used to track quests, settings, unlocks and game state.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "client_scripts",
    label: "Client Scripts",
    desc: "CS2 scripts — small programs run by the client to control interfaces, animations and game logic. Searchable by ID or by text strings found inside the script.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
  {
    key: "graphics",
    label: "Graphics",
    desc: "Graphic (spot anim) definitions — the visual effects played in the game world like spell impacts, skill level-ups, fire, smoke and other particle effects.",
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
    desc: "Render animation sets — the collection of animations assigned to an NPC or player for idle, walking, running, turning and strafing. Each row is a full movement animation set.",
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
    key: "skeletons",
    label: "Skeletons",
    desc: "Animation skeleton definitions — the bone structures that animations are applied to. Shows which NPCs share a skeleton and what animations and graphics are attached to it.",
    file: () => Promise.resolve({ default: [] }),
    toRows: () => [],
    columns: [],
    searchKeys: [],
  },
];
