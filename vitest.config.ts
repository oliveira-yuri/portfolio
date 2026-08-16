import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // next/font/google só funciona dentro do pipeline de build do Next;
      // sob Vitest/Vite substituímos por um stub (ver arquivo referenciado).
      'next/font/google': fileURLToPath(new URL('./src/test/mocks/next-font-google.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
