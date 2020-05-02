FROM node:alpine AS builder

RUN npm config set registry https://registry.npm.taobao.org

ADD . /workspace
WORKDIR /workspace

RUN npm i && npm run build


FROM node:alpine

RUN  echo 'http://mirrors.ustc.edu.cn/alpine/v3.5/main' > /etc/apk/repositories \
  && echo 'http://mirrors.ustc.edu.cn/alpine/v3.5/community' >>/etc/apk/repositories \
  && apk update && apk add tzdata \
  && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \ 
  && echo "Asia/Shanghai" > /etc/timezone

WORKDIR /workspace
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/config.json .
COPY --from=builder /workspace/package.json .
RUN npm config set registry https://registry.npm.taobao.org && npm i -D

CMD [ "node", "./dist/index" ]
