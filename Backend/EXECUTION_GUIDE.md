# Backend Execution Guide

Follow these steps to run the backend application:

## Prerequisites
- **Node.js** (v20+ recommended)
- **Docker & Docker Compose**
- **npm** (comes with Node.js)

## Setup Steps

### 1. Environment Configuration
Ensure your `.env` file in the `Backend` directory is correctly configured.
For Docker, the `DB_URL` should point to the database container:
`DB_URL=postgresql://postgres:postgres@db:5432/postgres?schema=public`

### 2. Run with Docker (Recommended)
This is the easiest way to start both the database and the backend.

```bash
cd Backend
docker-compose up --build
```

### 3. Run Locally (Standard)
If you prefer running the backend locally (assuming you have a PostgreSQL database running on localhost:5432):

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

3. **Run Migrations (Initial Setup)**
   ```bash
   npm run prisma:migrate
   ```

4. **Seed the Database**
   ```bash
   npx ts-node prisma/seed.ts
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Documentation
Once the server is running, you can access the Swagger documentation at:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Key Scripts
- `npm run dev`: Starts the development server with hot-reload.
- `npm run build`: Compiles TypeScript to JavaScript in the `dist` folder.
- `npm start`: Runs the compiled application.
- `npm test`: Executes the test suite with coverage report.
