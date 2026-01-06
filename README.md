# ECM_FE - English Course Management Frontend

Frontend application built with **React 19** and **Vite** for managing English courses, lessons, quizzes, and user progress.

Backend: [ECM_BE](https://github.com/Setsuna2207/ECM_BE)

---

## 🚀 Tech Stack
- **React 19** + **Vite**
- **Material-UI (MUI)** + **MUI X Data Grid**
- **React Router v7**
- **Axios** + **Framer Motion**

---

## 📂 Project Structure

```
ECM_FE/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/
│   │   ├── admin/        # Admin dashboard
│   │   ├── auth/         # Login, register
│   │   └── user/         # User pages
│   ├── services/         # API calls
│   │   └── axios/        # Axios config
│   ├── contexts/         # AuthContext
│   ├── utils/            # Helper functions
│   ├── assets/           # Images, icons
│   ├── Router.jsx        # Route config
│   └── theme.js          # MUI theme
├── .env                  # Environment vars
└── vite.config.js
```

---

## 📦 Setup

### Prerequisites
- **Node.js** v18+ - [Download](https://nodejs.org/)
- **Yarn** or **npm**
- **Backend API** running

### Installation
```bash
git clone https://github.com/Setsuna2207/ECM_FE.git
cd ECM_FE
yarn install
```

### Configuration
Create `.env`:
```env
VITE_API_BASE_URL=https://localhost:7264/api
VITE_API_TIMEOUT=60000
VITE_AUTH_STORAGE_KEY=ecm_token
```

**Note**: Restart dev server after changing `.env`

### Run
```bash
yarn dev
```
Available at http://localhost:5173

### Build
```bash
yarn build
yarn preview
```

---

## 🔑 Authentication

JWT token stored in `localStorage` (key: `ecm_token`)

**Roles**: 
- **Admin** - Full dashboard access (`/admin/*`)
- **User** - Browse courses, take lessons/quizzes/tests

**Flow**: Login → Token saved → Auto-injected in API requests → 401 redirects to login

---

## 🔌 API Services

Located in `services/`:
- `userService.js`                  - Auth & user management
- `courseService.js`                - Course operations
- `lessonService.js`                - Lesson management
- `quizService.js`                  - Quiz operations
- `fileUploadService.js`            - File uploads (video/document/image)
- `historyService.js`               - Learning progress
- `aiService.js`                    - AI recommendations

**Axios Config**: Auto-injects JWT token, handles 401 errors, 60s timeout

---

## 📁 File Upload

**Supported**:
- Videos: MP4, AVI, MOV, WebM (Max: 5GB)
- Documents: PDF, DOC, DOCX, PPT (Max: 100MB)
- Images: JPG, PNG, GIF, WebP (Max: 10MB)

**Google Drive**: Auto-converts sharing URLs to direct URLs (`imageUtils.js`)

---

## 🐛 Troubleshooting

- **API Connection**: Check backend running + `.env` URL includes `/api`
- **Timeout**: Increase `VITE_API_TIMEOUT` in `.env`
- **Login Issues**: Clear `localStorage` token
- **Media Not Loading**: Check file URLs + CORS settings
- **Build Errors**: Clear cache + reinstall: `yarn cache clean && yarn install`

---

## 🔗 Links
- Backend: [ECM_BE](https://github.com/Setsuna2207/ECM_BE)
- [React](https://react.dev/) | [Vite](https://vitejs.dev/) | [MUI](https://mui.com/)
