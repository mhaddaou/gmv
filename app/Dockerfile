FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build -p

EXPOSE 3000

# Use Vite's built-in preview server
CMD ["npm", "run", "preview"]