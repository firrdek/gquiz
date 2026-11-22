import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { execSync } from 'node:child_process'

// Version = 0.1.<number of commits>, so it increases with every commit.
// Railway builds from a source snapshot without .git (and without git), so fall
// back to the deployed commit hash there; it still changes with every push.
function appVersion(): string {
  try {
    const count = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    if (count && count !== '0') return `v0.1.${count}`
  } catch {
    // git is not available in this build environment
  }
  const sha = process.env.RAILWAY_GIT_COMMIT_SHA?.trim()
  if (sha) {
    console.log(`[version] git unavailable, using Railway commit ${sha.slice(0, 7)}`)
    return `v0.1.${sha.slice(0, 7)}`
  }
  return 'v0.1.0'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
})
