import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Einstellungen für das Bauen der App.
export default defineConfig({
  plugins: [react()],
  // Die App liegt bei GitHub Pages unter https://stift-und-papier.github.io/wortsalat/
  // Deshalb müssen alle Dateien mit diesem Pfad beginnen.
  base: '/wortsalat/',
  build: {
    // Auch etwas ältere iPads (Safari 15) sollen die App öffnen können.
    target: 'safari15',
  },
})
