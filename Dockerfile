FROM node:18-alpine AS builder

WORKDIR /ng-app

COPY package.json package-lock.json ./
RUN npm install --force

COPY . .

RUN npm run build --configuration=production

FROM nginx:1.25.4-alpine

COPY nginx/default.conf-preprod /etc/nginx/conf.d/default.conf

COPY --from=builder /ng-app/dist/geo-solucoes/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]