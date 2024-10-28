import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import VueRouter from 'unplugin-vue-router/vite';

export default defineConfig({
  plugins: [
    VueRouter({
      /* Router options, if any */
    }),
    vue(),
    vueJsx(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // Resolve @ to src
    }
  },
  // Uncomment and set BASE_URL if needed
  // define: {
  //   'import.meta.env.BASE_URL': JSON.stringify('/') // Set this to your actual base path if needed
  // }
});
