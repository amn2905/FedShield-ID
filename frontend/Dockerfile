# Stage 1: Build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using cache
COPY package*.json ./
RUN npm ci || npm install

# Build arguments for Vite environment
ARG VITE_API_URL="http://localhost:8000"
ENV VITE_API_URL=$VITE_API_URL

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production environment served via Nginx
FROM nginx:stable-alpine

# Install curl for container health check
RUN apk add --no-cache curl

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Root directory for static assets \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Reverse proxy API calls to backend container \
    location /api/ { \
        proxy_pass http://backend:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
