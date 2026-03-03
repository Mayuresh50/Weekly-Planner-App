# Weekly Planning System

A production-ready Weekly Planning System built with .NET 8 (Clean Architecture) and Angular 17+ (Material).

## Tech Stack
- **Backend**: .NET 8 Web API, EF Core, SQL Server, JWT Auth.
- **Frontend**: Angular 17, TypeScript, Angular Material, Reactive Forms.
- **DevOps**: Docker, environment-based configuration.

## Features
1. **Backlog Management**: Full CRUD for Client Focused, Tech Debt, and R&D tasks.
2. **Weekly Planning**: Tuesday planning for Wed-Mon cycle. 30-hour limit with category-level allocations.
3. **Plan Freeze**: Post-freeze, only progress updates are allowed.
4. **Lead Dashboard**: Aggregated progress charts and member performance tracking.
5. **Security**: Role-Based Access Control (Lead vs Member).

## Setup & Running

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- SQL Server (LocalDB or Docker)

### Run with Docker (Recommended)
```bash
docker-compose up --build
```

### Manual Run
**Backend:**
```bash
cd Backend
dotnet restore
dotnet run --project WeeklyPlanning.Api
```

**Frontend:**
```bash
cd Frontend
npm install
npm start
```

## Testing
- **Backend**: Run `dotnet test` in the `Backend` directory. Contains unit tests for hours validation, freeze logic, and allocation calculations.
- **Frontend**: Run `ng test` in the `Frontend` directory.

## Coverage Reports
To generate coverage reports:
1. Backend: Use `dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover`.
2. Frontend: Use `ng test --code-coverage`.
