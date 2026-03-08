import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks: {
          "data-items":    ["./src/data/item_definitions.json"],
          "data-npcs":     ["./src/data/npc_definitions.json"],
          "data-drops":    ["./src/data/drop_tables.json"],
          "data-objects":  ["./src/data/object_definitions.json"],
          "data-misc":     [
            "./src/data/varbit_definitions.json",
            "./src/data/varp_definitions.json",
            "./src/data/enum_definitions.json",
            "./src/data/struct_definitions.json",
            "./src/data/client_scripts.json",
            "./src/data/graphic_definitions.json",
            "./src/data/animation_skeletons.json",
            "./src/data/render_animation_definitions.json",
            "./src/data/identity_kit_definitions.json",
            "./src/data/inventory_definitions.json",
            "./src/data/world_map_definitions.json",
            "./src/data/world_map_info_definitions.json",
          ],
        },
      },
    },
  },
});
