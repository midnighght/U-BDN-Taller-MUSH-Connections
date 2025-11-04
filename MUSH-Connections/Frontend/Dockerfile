# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# For Docker builds we skip the TypeScript project build step (tsc -b)
# to speed up image build; Vite will compile necessary TS files.
# Use npx so we run the local vite binary installed by npm ci.
RUN npx vite build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]