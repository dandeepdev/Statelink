import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'statelink/web': resolve(__dirname, '../statelink/src/adapters/web/index.ts'),
      'statelink': resolve(__dirname, '../statelink/src/index.ts')
    }
  }
});
