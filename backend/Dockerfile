FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm install

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app ./

COPY .env.docker .env

ENV NODE_ENV=production
EXPOSE 5001

CMD ["npm", "start"]
