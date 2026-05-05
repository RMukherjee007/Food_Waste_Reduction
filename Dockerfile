# Stage 1: Build the React frontend
FROM node:22-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Serve the app with Node.js
FROM node:22-alpine
WORKDIR /app

# Install MariaDB and Redis
RUN apk add --no-cache mariadb mariadb-client redis

COPY package*.json ./
RUN npm install --production
COPY . .
# Copy the built React app from Stage 1
COPY --from=build /app/client/dist /app/client/dist

# Ensure the script is executable
RUN chmod +x start.sh

ENV PORT=8080
EXPOSE 8080

CMD ["./start.sh"]
