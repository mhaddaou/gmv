FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 6465

# Start the application
CMD ["node", "dist/server.js"]