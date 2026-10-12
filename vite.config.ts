import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Where Quizzed lives. index.html builds its canonical link and link-preview
// tags from this, and crawlers need the full address, so it is the public one
// even in a local build. Set VITE_SITE_URL to override it (no trailing slash).
const SITE_URL = 'https://quizzed.devferanmi.xyz';
process.env.VITE_SITE_URL ||= SITE_URL;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@icons': path.resolve(__dirname, 'src/ui/icons/index.ts'),
    },
  },
  server: {
    port: 5174,
    // Phones on the same network join by the host machine's address.
    host: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/*.test.ts'],
  },
});
