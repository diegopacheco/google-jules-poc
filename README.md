# google-jules-poc

This project is a proof-of-concept application using Google Jules. It includes a frontend, a backend, and a MySQL database, all containerized using Docker.

## Prerequisites

- Docker: [https://www.docker.com/get-started](https://www.docker.com/get-started)
- Docker Compose: (Usually included with Docker Desktop)

## Structure

- `/frontend`: Contains the frontend application (currently a placeholder Bun project).
- `/backend`: Contains the backend Go application (Gin framework).
- `/db`:
    - `schema.sql`: SQL script to initialize the database schema.
    - `mysql_data/`: (Git-ignored) Directory where MySQL data is persisted locally.
- `Dockerfile`: Located in `/frontend` and `/backend` for building the respective service images.
- `docker-compose.yml`: Defines the services (frontend, backend, mysql) and their configurations for Docker Compose.
- `start.sh`: A helper script to easily start the entire application stack.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd google-jules-poc
    ```

2.  **Ensure `start.sh` is executable:**
    If you cloned the repository on Windows or if the executable bit is not set, run:
    ```bash
    chmod +x start.sh
    ```

3.  **Start the application:**
    ```bash
    ./start.sh
    ```
    This command will:
    - Build the Docker images for the frontend and backend if they don't exist.
    - Start the MySQL, backend, and frontend containers in detached mode.
    - Create the `coaching_app` database and initialize the schema using `db/schema.sql` (on the first run for MySQL).
    - Persist MySQL data in `./db/mysql_data/`.

4.  **Accessing the services:**
    - **Frontend**: `http://localhost:3000` (The current frontend only logs to the console of its Docker container).
    - **Backend**: `http://localhost:8080` (e.g., `http://localhost:8080/teams` or `http://localhost:8080/members`).
    - **MySQL**: Accessible on `localhost:3306` from your host machine (e.g., using a database client).
        - Database name: `coaching_app`
        - User: `user`
        - Password: `password`
        - Root password: `rootpassword`

## Development

- To see logs for a specific service:
  ```bash
  docker-compose logs -f <service_name>  # e.g., backend, frontend, mysql_db
  ```
- To stop the services:
  ```bash
  docker-compose down
  ```
- If you make changes to the frontend or backend code:
    - For simple changes (if live reload is configured and working for your specific frontend/backend setup within Docker), they might be reflected automatically.
    - For changes that require a rebuild of the Docker image (e.g., changing dependencies in `go.mod` or `package.json`, or modifying the Dockerfile itself):
      ```bash
      docker-compose build <service_name> # e.g., backend or frontend
      ./start.sh # or docker-compose up -d --no-deps <service_name> to restart only one service
      ```
    - To force a full rebuild of all images and restart:
      ```bash
      docker-compose down
      docker-compose build --no-cache
      ./start.sh
      ```

## Database

- The database schema is defined in `db/schema.sql`.
- MySQL data is stored in `./db/mysql_data/` on your host machine and is git-ignored. This means your data will persist across `docker-compose down` and `docker-compose up`.
- To reset the database completely (lose all data):
    1. Stop the services: `docker-compose down`
    2. Delete the data directory: `sudo rm -rf ./db/mysql_data/` (use `sudo` if Docker created it as root)
    3. Restart: `./start.sh`. The `schema.sql` will be re-applied.
