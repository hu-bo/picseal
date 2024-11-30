FROM node:22 AS build

RUN useradd -m picseal

USER picseal

ENV HOME=/home/picseal

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="$HOME/.cargo/bin:$PATH"

RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y

WORKDIR /app

COPY . .

USER root

RUN chown -R picseal:picseal /app && \
    chmod -R 755 /app

ENV NPM_VERSION=10.9.1
RUN npm cache clean --force && \
    npm install -g npm@"${NPM_VERSION}"

RUN npm install && \
    npm run build

USER picseal

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
