FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

EXPOSE 4173

# Use Vite's built-in preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]