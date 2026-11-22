import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { execSync } from 'node:child_process'

// Version = 0.1.<number of commits>, so it increases with every commit
function commitCount(): string {
  try {
    return execSync('git rev-list --count HEAD').toString().trim()
  } catch {
    return '0'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(`v0.1.${commitCount()}`),
  },
})
