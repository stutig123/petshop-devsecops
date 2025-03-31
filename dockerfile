# Stage 1: Install dependencies
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Image
FROM node:18-alpine
WORKDIR /app

# Copy installed dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set a non-root user for security
USER node

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
