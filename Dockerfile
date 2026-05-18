FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
ENV DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run db:generate
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
