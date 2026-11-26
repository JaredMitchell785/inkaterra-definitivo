import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Todo lo que empiece con /api se envía al backend (Express)
const proxy = { '/api': 'http://localhost:3001' };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { proxy }
});
