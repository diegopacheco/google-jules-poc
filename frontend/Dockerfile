# Use an official Bun image
FROM oven/bun:1 AS base

WORKDIR /usr/src/app

# Copy package.json and bun.lockb to leverage Docker cache
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose a port if the frontend were to run a dev server (e.g., 3000)
# For now, since index.ts only logs, this is more of a placeholder.
EXPOSE 3000

# Command to run the index.ts file using bun.
# This will keep the container running and execute the script.
# For a real app, this would be `bun run dev` or `bun start`
CMD ["bunx", "vite", "--host", "0.0.0.0", "--port", "3000"]
