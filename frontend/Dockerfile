# Stage 1: Build environment
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production environment served via Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Write a basic Nginx configuration to handle React Router client-side routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    # Forward API requests to the backend service in Docker Compose \
    location /api/ { \
        proxy_pass http://backend:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
