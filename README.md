# Expense Tracker

A full-stack expense tracking application built with .NET 8 Web API and React.

## Features

- 🔐 User authentication with JWT
- 💰 Create, read, update, and delete expenses
- 🏷️ Category management with custom colors
- 📊 Visual reports and analytics
- 🔍 Filter expenses by date range and category
- 📱 Responsive design

## Tech Stack

### Backend
- .NET 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- BCrypt for password hashing

### Frontend
- React 18
- React Router
- React Hook Form
- Axios
- Recharts (for data visualization)

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v16 or higher)
- SQL Server

### Backend Setup

1. Navigate to the backend directory:
   ```powershell
   cd Backend/ExpenseAPI
   ```

2. Update the connection string in `appsettings.json`

3. Run database migrations:
   ```powershell
   dotnet ef database update
   ```

4. Start the API:
   ```powershell
   dotnet run
   ```

The API will run on `http://localhost:5238`

### Frontend Setup

1. Navigate to the frontend directory:
   ```powershell
   cd expense-tracker-ui
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Update the `.env` file with your API URL:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5238/api
   ```

4. Start the development server:
   ```powershell
   npm start
   ```

The app will open at `http://localhost:3000`

## Project Structure

```
ExpenseTracker/
├── Backend/
│   └── ExpenseAPI/
│       ├── Controllers/
│       ├── Models/
│       ├── Services/
│       └── Data/
└── expense-tracker-ui/
    └── src/
        ├── components/
        ├── services/
        └── App.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

## License

This project is open source and available under the MIT License.
