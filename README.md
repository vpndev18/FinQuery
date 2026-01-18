# Expense Tracker

## Docker Setup

### Prerequisites
- Docker Desktop installed and running.

### How to Run
1. Open a terminal in the project root.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Wait for the containers to start. The first time, it will take a few minutes to download images.
   - Look for "Database migrated successfully" in the logs.

### Accessing the Application

- **Frontend (UI):** [http://localhost:3000](http://localhost:3000)
- **Backend (API Swagger):** [http://localhost:8080/swagger](http://localhost:8080/swagger)

### Troubleshooting
- **Database Access Denied:** run `docker-compose down -v` to reset the volume.
- **Port Conflicts:** Ensure ports 3000, 8080, 1433, and 6379 are free.
