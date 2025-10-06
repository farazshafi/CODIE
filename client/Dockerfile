# ---- Builder Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package.json and lock file first
COPY package*.json ./

# Install dependencies (cached unless package.json changes)
RUN npm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build the project
RUN npm run build


# ---- Runner Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only necessary build output + node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
