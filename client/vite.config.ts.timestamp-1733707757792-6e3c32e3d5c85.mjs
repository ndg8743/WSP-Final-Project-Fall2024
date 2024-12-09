// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import vueDevTools from "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import VueRouter from "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/node_modules/unplugin-vue-router/dist/vite.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/nateg/OneDrive/Desktop/WSP-Final-Project-Fall2024/client/vite.config.ts";
var vite_config_default = defineConfig({
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
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      // Resolve @ to src
    }
  }
  // Uncomment and set BASE_URL if needed
  // define: {
  //   'import.meta.env.BASE_URL': JSON.stringify('/') // Set this to your actual base path if needed
  // }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuYXRlZ1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFdTUC1GaW5hbC1Qcm9qZWN0LUZhbGwyMDI0XFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbmF0ZWdcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxXU1AtRmluYWwtUHJvamVjdC1GYWxsMjAyNFxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL25hdGVnL09uZURyaXZlL0Rlc2t0b3AvV1NQLUZpbmFsLVByb2plY3QtRmFsbDIwMjQvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xyXG5pbXBvcnQgdnVlRGV2VG9vbHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzJztcclxuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBWdWVSb3V0ZXIoe1xyXG4gICAgICAvKiBSb3V0ZXIgb3B0aW9ucywgaWYgYW55ICovXHJcbiAgICB9KSxcclxuICAgIHZ1ZSgpLFxyXG4gICAgdnVlSnN4KCksXHJcbiAgICB2dWVEZXZUb29scygpXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSAvLyBSZXNvbHZlIEAgdG8gc3JjXHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBVbmNvbW1lbnQgYW5kIHNldCBCQVNFX1VSTCBpZiBuZWVkZWRcclxuICAvLyBkZWZpbmU6IHtcclxuICAvLyAgICdpbXBvcnQubWV0YS5lbnYuQkFTRV9VUkwnOiBKU09OLnN0cmluZ2lmeSgnLycpIC8vIFNldCB0aGlzIHRvIHlvdXIgYWN0dWFsIGJhc2UgcGF0aCBpZiBuZWVkZWRcclxuICAvLyB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ZLFNBQVMsZUFBZSxXQUFXO0FBQ3RhLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxlQUFlO0FBTGlPLElBQU0sMkNBQTJDO0FBT3hTLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQTtBQUFBLElBRVYsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUE7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
