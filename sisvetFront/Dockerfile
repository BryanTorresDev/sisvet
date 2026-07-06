# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from build stage to nginx html folder
COPY --from=build /app/dist/sisvetFront/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
