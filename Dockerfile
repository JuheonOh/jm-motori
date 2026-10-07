FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
EXPOSE 5173
CMD ["sh", "-c", "npm ci && npm run dev -- --host 0.0.0.0"]

FROM dev AS build
ARG VITE_NAVER_MAP_CLIENT_ID=""
ENV VITE_NAVER_MAP_CLIENT_ID=$VITE_NAVER_MAP_CLIENT_ID
RUN npm ci && npm run build

FROM nginx:stable-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
