export default {
  '*.{js,ts,tsx,svelte,md,html,json,css}': ['prettier --write'],
  '*.{js,ts,tsx}': (filenames) => {
    // Route each file to its app's ESLint config since configs live per-app
    const configForFile = (f) => {
      if (f.startsWith('apps/backend/')) return 'apps/backend/eslint.config.mjs'
      if (f.startsWith('apps/admin/')) return 'apps/admin/eslint.config.js'
      if (f.startsWith('apps/frontend/')) return 'apps/frontend/eslint.config.js'
      return undefined // no root config, skip
    }

    const groups = {}
    for (const f of filenames) {
      const config = configForFile(f)
      if (!config) continue
      if (!groups[config]) groups[config] = []
      groups[config].push(f)
    }

    return Object.entries(groups).map(([config, files]) => {
      return `eslint --fix --config ${config} ${files.join(' ')}`
    })
  },
}
