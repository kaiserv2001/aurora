import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // WSL2 note: files on /mnt/* don't emit native inotify events, so HMR misses
  // edits and the dev server serves stale modules. Polling fixes it.
  server: { watch: { usePolling: true, interval: 200 } },
})
