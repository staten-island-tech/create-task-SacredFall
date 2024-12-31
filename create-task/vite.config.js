import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        mines: "src/mines.html",
        chime: "/chime.mp3",
        boom: "/boom.mp3",
        gem: "/gem.svg",
        bomg: "/bomb.svg",
        cashout: "/cashout.wav",
      },
    },
  },
});
