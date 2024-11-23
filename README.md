# picseal

模仿小米照片风格，生成莱卡水印照片。同时支持佳能、尼康、苹果、华为、小米、DJI 等水印。可自动识别，也可自定义处理。

在线试用：[picseal](https://zhiweio.github.io/picseal/)

![](./public/screenshot.png)

|           Deploy with Vercel            |
| :-------------------------------------: |
| [![][deploy-button-image]][deploy-link] |

#### Deploy locally

1. Clone the repository

   ```bash
   git clone https://github.com/zhiwei/picseal
   ```

2. Install dependencies

    ```bash
    # Install Rustup (compiler)
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    # Install wasm-pack
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y
    ```

3. Build and run

   ```bash
   npm install
   npm run build
   npm run preview
   ```

#### Deploy with GitHub Pages

Configure `base` in `vite.config.ts` to your GitHub Pages URL (e.g. `https://<USERNAME>.github.io/<REPO>/`).

```javascript
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    visualizer({ open: true }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['picseal'],
  },
  base: 'https://zhiweio.github.io/picseal/',
})
```

Build and run

   ```bash
   npm install
   npm run pages
   ```

<!-- LINK GROUP -->

[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=
