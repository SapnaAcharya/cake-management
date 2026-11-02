#  Cake Management System

A full-stack Cake Management System developed using **ASP.NET Core Web API and React.js**. The application provides an online platform for browsing cakes, managing shopping carts, placing orders, and managing store operations through an admin dashboard.

The system follows a client-server architecture, with a RESTful backend API and a responsive React frontend.

##  Technologies Used

### Backend
- ASP.NET Core Web API
- C#
- Entity Framework Core
- Microsoft SQL Server
- JWT Authentication
- Role-Based Authorization
- RESTful API
- Swagger / OpenAPI

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- Axios / Fetch API (as implemented)
- React Hooks

### Development Tools
- Visual Studio
- Visual Studio Code
- SQL Server Management Studio (SSMS)
- Git and GitHub
- Swagger UI
- npm

##  Features

### Customer Features
- Customer registration and login
- JWT-based authentication
- Browse available cakes
- Search and pagination
- View cake details
- Add cakes to shopping cart
- Update and remove cart items
- Guest shopping cart
- Guest checkout
- Customer checkout
- Cash on Delivery
- Place orders
- View order history and order details
- Manage customer profile

### Admin Features
- Admin authentication and authorization
- Admin dashboard
- Manage cakes (Create, Read, Update, Delete)
- Manage cake categories
- Manage users
- View and manage customer orders
- Update order status
- Manage cake stock and availability

### Training Management
- Display available cake training packages
- Manage training package information
- Training package courses (where enabled)
- Course enrollment functionality (where enabled)

##  Authentication and Authorization

The application uses **JWT (JSON Web Token) authentication** to secure protected API endpoints.

- Customers can register and log in.
- Admin and Customer roles are used for role-based authorization.
- JWT bearer tokens are used to access protected endpoints.
- Admin-only operations are restricted to authorized administrators.
- Customer operations are restricted to authenticated customers.

##  Project Architecture

The project follows a separated frontend and backend architecture.

```text
CakeManagement/
│
├── CakeManagementAPI/
│   ├── Controllers/
│   ├── Models/
│   ├── DTOs/
│   ├── Services/
│   │   └── Interfaces/
│   ├── Data/
│   ├── Migrations/
│   ├── Program.cs
│   └── appsettings.json
│
└── cake-management-frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   ├── hooks/
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

##  Application Workflow

```text
          React Frontend
                |
                |
          HTTP Requests
                |
                v
       ASP.NET Core Web API
                |
                v
            Controllers
                |
                v
             Services
                |
                v
         Entity Framework Core
                |
                v
          SQL Server Database
```

##  Database

The application uses Microsoft SQL Server as its relational database.

Entity Framework Core is used for database operations and migrations.

Main entities include:

- User
- Category
- Cake
- Cart
- CartItem
- Order
- OrderItem

Additional entities are included according to the implemented modules.

##  API Documentation

The backend API is documented using Swagger / OpenAPI.

After starting the backend, access Swagger through the configured development URL:

```text
https://localhost:<port>/swagger
```

Swagger allows developers to:

- View available API endpoints.
- Test HTTP requests.
- Provide JWT bearer tokens.
- Inspect request and response models.
- Test protected endpoints.

##  Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

```bash
cd CakeManagement
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd CakeManagementAPI
```

Restore dependencies:

```bash
dotnet restore
```

Configure the SQL Server connection string and application settings using your local development configuration.

Apply Entity Framework Core migrations:

```bash
dotnet ef database update
```

Run the backend:

```bash
dotnet run
```

The backend API will start at the configured localhost URL.

Swagger documentation will be available at:

```text
https://localhost:<port>/swagger
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd cake-management-frontend
```

Install dependencies:

```bash
npm install
```

Configure the backend API base URL in your frontend environment configuration.

Start the development server:

```bash
npm run dev
```

The frontend will be available at the Vite development URL, usually:

```text
http://localhost:5173
```

##  Environment Configuration

Before running the application, configure the required environment variables and local settings.

Backend configuration may include:

- SQL Server connection string
- JWT secret key
- JWT issuer and audience
- Email service settings (if enabled)

Frontend configuration may include:

- Backend API base URL

**Important:** Never commit database passwords, JWT secret keys, email credentials, API keys, or other sensitive information to GitHub.

Use local development secrets or environment variables instead.

##  Application Screenshots

Screenshots of the application will be added here to demonstrate the user interface and main functionalities.

Suggested screenshots:

1. Home Page
2. Customer Login and Registration
3. Cake Listing Page
4. Cake Details Page
5. Shopping Cart
6. Checkout Page
7. Customer Order History
8. Admin Dashboard
9. Manage Cakes
10. Manage Categories
11. Manage Users
12. Training Packages (if included)

##  Future Improvements

Potential improvements for future development:

- Online payment gateway integration
- Advanced sales reports and analytics
- Customer reviews and ratings
- Order notifications
- Improved inventory reporting
- Additional dashboard statistics

##  Developer

Developed as a full-stack web application project to demonstrate practical skills in:

- ASP.NET Core Web API development
- RESTful API design
- C# and Entity Framework Core
- SQL Server database management
- JWT authentication and role-based authorization
- React.js frontend development
- Frontend and backend integration
- Git and GitHub version control

---

**Cake Management System** – Managing cakes, customers, shopping carts, and orders through a full-stack web application.
