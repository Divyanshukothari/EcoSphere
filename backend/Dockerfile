FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 5000

# Seed admin user (idempotent), then start server
CMD ["sh", "-c", "node seed_admin.js && node index.js"]
