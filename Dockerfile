FROM node:22 AS build

RUN useradd -m picseal

USER picseal

ENV HOME=/home/picseal

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="$HOME/.cargo/bin:$PATH"

RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y

WORKDIR /app

COPY public/ scripts/ src/ src-wasm/ eslint.config.js index.html package.json tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./

RUN npm install

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
