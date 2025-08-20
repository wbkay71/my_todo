# ToDo App

A complete full-stack ToDo application built with TypeScript, Express, React, and SQLite.

## 🚀 Features

- **User Authentication**: Registration and login with JWT
- **Todo Management**: Create, edit, delete, and status management
- **Priorities**: Todos with priority levels from 0-10
- **Responsive Design**: Works on desktop and mobile
- **TypeScript**: Fully typed for better developer experience
- **SQLite Database**: Local data storage with Foreign Key Constraints

## 📁 Project Structure

```
todo-app/
├── backend/                # Express.js Backend
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── db/           # Database connection & schema
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── api/         # API client
│   │   ├── types.ts     # TypeScript types
│   │   └── main.tsx     # Frontend entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd todo-app
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit the `.env` file and set a secure JWT_SECRET:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_PATH=./database.sqlite
PORT=3001
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start Application

**Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

The application is available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user information (protected)

### Todos

- `GET /api/todos` - Get all user's todos (protected)
- `GET /api/todos/:id` - Get single todo (protected)
- `POST /api/todos` - Create new todo (protected)
- `PATCH /api/todos/:id` - Update todo (protected)
- `DELETE /api/todos/:id` - Delete todo (protected)

### Utility

- `GET /health` - Health Check

## 🔧 Development

### Backend Scripts

```bash
npm run dev      # Development server with hot-reload
npm run build    # Compile TypeScript
npm start        # Production server
npm run clean    # Clean build folder
```

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview build
npm run lint     # Run ESLint
```

## 📊 Database Schema

### Users
- `id` (INTEGER PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `name` (VARCHAR, optional)
- `created_at` (DATETIME)

### Todos
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FK to users.id)
- `title` (VARCHAR)
- `description` (TEXT, optional)
- `status` (VARCHAR: 'open', 'in_progress', 'completed', 'cancelled')
- `priority` (INTEGER 0-10)
- `due_date` (DATE, optional)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Labels & Todo_Labels
- Support for todo labels (future enhancement)

## 🔐 Security

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- CORS protection enabled
- SQL injection protection through prepared statements
- Input validation on client and server side

## 🎨 Frontend Features

- **Modern UI**: Clean, responsive design
- **Todo Groups**: Automatic grouping by status
- **Priority Visualization**: Color-coded priority badges
- **Inline Editing**: Edit todos directly in the list
- **Real-time Updates**: Instant UI updates after changes

## 🚀 Deployment

### Backend (Production)

1. Set environment variables
2. Run `npm run build`
3. Run `npm start` for production server

### Frontend (Production)

1. Run `npm run build`
2. Deploy `dist/` folder to web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Create a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💡 Future Enhancements

- [ ] Todo labels and categories
- [ ] Due date reminders
- [ ] Todo search and filters
- [ ] User profiles
- [ ] Todo sharing between users
- [ ] Dark mode
- [ ] Push notifications
- [ ] Mobile app (React Native)

## 📞 Support

For questions or issues, please create an issue in the repository.
