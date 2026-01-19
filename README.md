# Store Rating Platform

A full-stack web application that allows users to submit ratings for stores registered on the platform.

## Tech Stack
- **Backend:** Express.js with Node.js
- **Database:** MySQL
- **Frontend:** React.js

## Features

### User Roles

1. **System Administrator**
   - Dashboard with stats (total users, stores, ratings)
   - Add/view stores, normal users, and admin users
   - Filter users and stores by name, email, address, role
   - View user details with ratings for store owners

2. **Normal User**
   - Sign up and login
   - View all registered stores
   - Search stores by name and address
   - Submit and modify ratings (1-5 stars)
   - Update password

3. **Store Owner**
   - Login and view dashboard
   - See list of users who rated their store
   - View average store rating
   - Update password

### Form Validations
- **Name:** 20-60 characters
- **Address:** Max 400 characters
- **Password:** 8-16 characters, at least 1 uppercase letter, 1 special character
- **Email:** Standard email validation

### Additional Features
- Sortable tables (ascending/descending)
- JWT authentication
- Role-based access control
- Responsive design

## Project Structure

```
store-rating-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── ratingController.js
│   │   ├── storeController.js
│   │   └── userController.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validators.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── storeRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── DashboardLayout.js
    │   │   ├── Modal.js
    │   │   └── StarRating.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── Dashboard.js
    │   │   │   ├── Stores.js
    │   │   │   ├── UserDetail.js
    │   │   │   └── Users.js
    │   │   ├── owner/
    │   │   │   ├── Dashboard.js
    │   │   │   └── Password.js
    │   │   ├── user/
    │   │   │   ├── Password.js
    │   │   │   └── Stores.js
    │   │   ├── Login.js
    │   │   └── Register.js
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── validation.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Database Setup

1. Start MySQL server
2. Create the database and tables:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or manually run the SQL commands in `backend/database/schema.sql`

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

4. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Admin Credentials

- **Email:** admin@storerating.com
- **Password:** Admin@123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `PUT /api/auth/password` - Update password (protected)
- `GET /api/auth/profile` - Get current user profile (protected)

### Users (Admin only)
- `GET /api/users` - Get all users with filters
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - Get all stores (protected)
- `GET /api/stores/:id` - Get store by ID (protected)
- `GET /api/stores/admin/list` - Get stores for admin (admin only)
- `POST /api/stores` - Create new store (admin only)
- `DELETE /api/stores/:id` - Delete store (admin only)

### Ratings
- `POST /api/ratings` - Submit/update rating (user only)
- `GET /api/ratings/store/:storeId` - Get user's rating for store
- `GET /api/ratings/my-store` - Get store owner's ratings

### Dashboard
- `GET /api/dashboard/stats` - Get admin dashboard stats (admin only)

## Testing the Application

1. **Login as Admin:**
   - Use default credentials to access admin dashboard
   - Add some stores and users (including store owners)

2. **Create Store Owner:**
   - As admin, create a user with role "Store Owner"
   - Create a store and assign the store owner

3. **Register as Normal User:**
   - Use the registration page to create a normal user
   - Login and browse stores
   - Submit ratings for stores

4. **Login as Store Owner:**
   - Use store owner credentials
   - View the dashboard with ratings submitted by users

