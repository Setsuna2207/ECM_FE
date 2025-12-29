# ECM_FE - English Course Management Frontend

Frontend application built with **React 19** and **Vite**.

Backend: [https://github.com/Setsuna2207/ECM_BE]

---

## 🚀 Tech Stack
- React 19
- Vite
- Material-UI
- React Router
- Axios

---

## 📂 Project Structure

```
.
├── src/
│   ├── components/           # Reusable UI Components
│   ├── pages/                # Page Components
│   │   ├── admin/            # Admin Pages
│   │   ├── auth/             # Authentication Pages
│   │   └── user/             # User Pages
│   ├── services/             # API Service Modules
│   ├── App.jsx               # Main App Component with Routes
│   └── main.jsx              # Application Entry Point
├── public/                   # Static Assets
├── .env                      # Environment Variables
└── vite.config.js            # Vite Configuration
```

---

## 📦 Setup

### Prerequisites
- Node.js (v18+)
- Yarn or npm

### Installation
```bash
git clone https://github.com/Setsuna2207/ECM_FE.git
cd ECM_FE
yarn install
```

### Configuration
Create `.env`:
```env
VITE_API_BASE_URL=https://localhost:7264
```

### Run
```bash
yarn dev
```
Available at [http://localhost:5173](http://localhost:5173)

### Build
```bash
yarn build
```

---

## 🔑 Authentication

Uses **JWT tokens** stored in localStorage. Axios interceptor handles token injection and 401 errors.

---

## 👥 User Roles

**Admin**: Manage courses, lessons, quizzes, tests, users, reviews

**User**: Browse courses, enroll, complete lessons/quizzes, take tests, write reviews, track progress

---

## 🌐 API Integration

Services in `services/` directory:

---

## 🐛 Troubleshooting

- **API Connection Failed**:    Verify backend running and `.env` configured
- **Login Issues**:             Check console and localStorage token
- **Media Not Loading**:        Verify backend URL and file paths
- **Build Errors**:             Clear cache and reinstall dependencies

---

## 🔗 Links
- Backend: [https://github.com/Setsuna2207/ECM_BE]
- React: [https://react.dev/]
- Vite: [https://vitejs.dev/]
