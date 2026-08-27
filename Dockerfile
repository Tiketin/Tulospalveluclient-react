# Stage 1: Build static production assets
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build project
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy built static assets from Stage 1 to Nginx default folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 3001 for web traffic
EXPOSE 3001

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]