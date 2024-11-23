# picseal

模仿小米照片风格，生成莱卡水印照片。同时支持佳能、尼康、苹果、华为、小米、DJI 等水印。可自动识别，也可自定义处理。

![](./public/screenshot.png)

## Running Locally

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
   npm run build
   npm run preview
   ```
