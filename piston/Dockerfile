FROM node:18-bullseye-slim

# Prevent interactive prompts during package installation (e.g., tzdata)
ENV DEBIAN_FRONTEND=noninteractive

# Install runtimes & compilers for Python, C++, Java, Go, Rust, Ruby, C#
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    g++ \
    default-jdk-headless \
    golang-go \
    rustc \
    ruby \
    mono-devel \
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


