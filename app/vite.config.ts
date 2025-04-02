import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import moment from 'moment';
import path from 'path';
function getBuildDate() {
  return moment().format('MM/DD/YYYY');
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.BUILD_DATE': JSON.stringify(getBuildDate())
  }, // Enables React fast refresh and other features
  resolve: {
    alias: {
      // Setup any necessary aliases here
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/', // Adjust this if you're deploying to a subdirectory
  build: {
    outDir: 'build', // Default output directory
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // You can add more entries if your app needs them
      },
    },
  },
});