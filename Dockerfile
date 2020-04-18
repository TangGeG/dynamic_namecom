FROM node:alpine AS builder

RUN npm config set registry https://registry.npm.taobao.org

ADD . /workspace
WORKDIR /workspace

RUN npm i && npm run build


FROM node:alpine

WORKDIR /workspace
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/config.json .
COPY --from=builder /workspace/package.json .
RUN npm config set registry https://registry.npm.taobao.org && npm i -D

CMD [ "node", "./dist/index" ]
