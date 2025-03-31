# Base image for building dependencies
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production  # Installs only production dependencies

# Copy application source code
COPY . .

# Remove unnecessary dev dependencies
RUN npm prune --production  

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/dist ./dist  # Ensure the app build is included
COPY --from=builder /app/ ./ 

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
