FROM node:18-slim

# Install Python and clean up
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json ./
RUN npm install

# Copy the server code
COPY server.js .

# Expose the Piston port
EXPOSE 2000

# Run the lite server
CMD ["node", "server.js"]
