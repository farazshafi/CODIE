FROM node:18-bullseye-slim

# Install runtimes & compilers for Python, C++, Java, Go, Rust, Ruby, C# (Mono)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    g++ \
    default-jdk-headless \
    golang \
    rustc \
    ruby \
    mono-mcs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./
RUN npm install --production

# Copy the server code
COPY server.js .

# Expose port (Render sets process.env.PORT automatically)
EXPOSE 2000

# Run the server
CMD ["node", "server.js"]

