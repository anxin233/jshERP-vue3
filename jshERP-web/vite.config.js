import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolve (dir) {
  return path.resolve(__dirname, dir)
}

function normalizeBase (value) {
  const base = value || '/erp/'
  const withStart = base.startsWith('/') ? base : `/${base}`
  return withStart.endsWith('/') ? withStart : `${withStart}/`
}

function gzipAssets () {
  return {
    name: 'jsh-gzip-assets',
    apply: 'build',
    generateBundle (_, bundle) {
      Object.entries(bundle).forEach(([fileName, output]) => {
        if (!/\.(js|css)$/i.test(fileName)) {
          return
        }
        const source = output.type === 'asset' ? output.source : output.code
        const content = typeof source === 'string' ? Buffer.from(source) : source
        if (!content || content.length < 10240) {
          return
        }
        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.gz`,
          source: gzipSync(content)
        })
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'VITE_')
  const isProduction = mode === 'production'
  const base = normalizeBase(env.VITE_APP_PUBLIC_PATH)

  return {
    base,
    envPrefix: 'VITE_',
    plugins: [
      vue(),
      isProduction && gzipAssets()
    ].filter(Boolean),
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@': resolve('src'),
        '@$': resolve('src'),
        '@api': resolve('src/api'),
        '@assets': resolve('src/assets'),
        '@comp': resolve('src/components'),
        '@views': resolve('src/views')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/erp/jshERP-boot': {
          target: 'http://localhost:9999',
          ws: false,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/erp/, '')
        },
        '/jshERP-boot': {
          target: 'http://localhost:9999',
          ws: false,
          changeOrigin: true
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173
    },
    css: {
      lightningcss: {
        errorRecovery: true
      },
      preprocessorOptions: {
        less: {
          modifyVars: {
            'primary-color': '#1890FF',
            'link-color': '#1890FF',
            'border-radius-base': '4px',
            'font-size-base': '14px',
            'font-size-lg': '16px',
            'text-color-secondary': 'rgba(0, 0, 0, 0.45)',
            'heading-color': 'rgba(0, 0, 0, 0.85)',
            'red-6': '#f5222d',
            'green-6': '#52c41a',
            'avatar-size-base': '32px',
            'avatar-size-lg': '40px',
            'avatar-size-sm': '24px'
          },
          javascriptEnabled: true,
          math: 'always'
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      assetsDir: 'static',
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: assetInfo => {
            const name = assetInfo.name || ''
            if (name.endsWith('.css')) {
              return 'css/[name].[hash][extname]'
            }
            return 'static/[name].[hash][extname]'
          }
        }
      }
    },
    esbuild: isProduction
      ? {
          drop: ['console']
        }
      : undefined
  }
})
