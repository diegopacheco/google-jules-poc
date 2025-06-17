# Stage 1: Build the Go application
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application
# CGO_ENABLED=0 is important for building a static binary that can run in a minimal image
# -o /app/server makes the output binary named 'server' in the /app directory
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/server .

# Stage 2: Create a minimal runtime image
FROM alpine:latest

WORKDIR /app

# Copy the built executable from the builder stage
COPY --from=builder /app/server /app/server

# Expose port 8080 (or whatever port your Gin app listens on)
EXPOSE 8080

# Command to run the executable
CMD ["/app/server"]
