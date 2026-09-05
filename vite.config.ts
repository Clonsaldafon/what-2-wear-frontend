import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const toNumber = (value: string | undefined) => {
  if (!value) return undefined

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrHost = env.VITE_DEV_HMR_HOST
  const hmrProtocol = env.VITE_DEV_HMR_PROTOCOL || (hmrHost ? 'wss' : undefined)
  const hmrClientPort = toNumber(env.VITE_DEV_HMR_CLIENT_PORT)
  const allowedHosts = [
    'blatantly-profound-koel.cloudpub.ru',
    hmrHost,
  ].filter(Boolean) as string[]

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      host: env.VITE_DEV_SERVER_HOST || 'localhost',
      proxy: {
        '/api': 'http://localhost:8000'
      },
      allowedHosts,
      hmr: hmrHost
        ? {
            host: hmrHost,
            protocol: hmrProtocol,
            clientPort: hmrClientPort,
          }
        : undefined,
    }
  }
})
