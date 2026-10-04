FROM node:18-bullseye-slim

# Prevent interactive prompts during package installation (e.g., tzdata)
ENV DEBIAN_FRONTEND=noninteractive

# Step 1: Base system & certificates
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Step 2: Python
RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*

# Step 3: C++
RUN apt-get update && apt-get install -y --no-install-recommends g++ && rm -rf /var/lib/apt/lists/*

# Step 4: Java
RUN apt-get update && apt-get install -y --no-install-recommends default-jdk-headless && rm -rf /var/lib/apt/lists/*

# Step 5: Go
RUN apt-get update && apt-get install -y --no-install-recommends golang-go && rm -rf /var/lib/apt/lists/*

# Step 6: Rust
RUN apt-get update && apt-get install -y --no-install-recommends rustc && rm -rf /var/lib/apt/lists/*

# Step 7: Ruby
RUN apt-get update && apt-get install -y --no-install-recommends ruby && rm -rf /var/lib/apt/lists/*

# Step 8: C# (Mono)
RUN apt-get update && apt-get install -y --no-install-recommends mono-devel && rm -rf /var/lib/apt/lists/*

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


