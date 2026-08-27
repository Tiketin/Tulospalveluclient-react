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

# Expose port 80 for web traffic
EXPOSE 80

# Create env-config.js at container startup, then start Nginx
CMD ["/bin/sh", "-c", "echo \"window._env_ = { REACT_APP_API_URL: '${REACT_APP_API_URL}' };\" > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]