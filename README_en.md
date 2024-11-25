# Picseal

Generate Leica-style watermark photos inspired by Xiaomi's photo style. Picseal supports automatic or custom watermark generation for Canon, Nikon, Apple, Huawei, Xiaomi, DJI, and more.

English [中文](./README.md)

## Online Demo

Try it online:
- [picseal.vercel.app](https://picseal.vercel.app)
- [picseal.zhiweio.me](https://picseal.zhiweio.me)
- [zhiweio.github.io/picseal](https://zhiweio.github.io/picseal/)

![App Screenshot](./public/screenshot.png)

## Deployment

### Deploy with Vercel

|           Deploy with Vercel            |
| :-------------------------------------: |
| [![][deploy-button-image]][deploy-link] |

### Deploy Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zhiweio/picseal
   ```

2. **Install dependencies**:
   ```bash
   # Install Rustup (compiler)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

   # Install wasm-pack
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y
   ```

3. **Build and run**:
   ```bash
   npm install
   npm run build
   npm run preview
   ```

### Deploy with GitHub Pages

1. Configure the `base` in `vite.config.ts` to match your GitHub Pages URL (e.g., `https://<USERNAME>.github.io/<REPO>/`):
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

2. **Build and deploy**:
   ```bash
   npm install
   npm run pages
   ```

## Authors

- [@Wang Zhiwei](https://github.com/zhiweio)

## License

[MIT](https://choosealicense.com/licenses/mit/)

<!-- LINK GROUP -->
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzhiweio%2Fpicseal&project-name=picseal&repository-name=picseal
