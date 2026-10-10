# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install

# Copy client package files and build frontend
COPY client/package*.json ./client/
RUN cd client && npm install

COPY . .
RUN cd client && npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5050

# Copy root dependencies and app
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

# Expose port
EXPOSE 5050

# Start server
CMD ["node", "server/server.js"]
