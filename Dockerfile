FROM node:20-slim

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
