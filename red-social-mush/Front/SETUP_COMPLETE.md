# 🎨 MUSH Frontend - Environment Variables Setup Complete

## ✅ What Was Done

### 1. Created Environment Files
- **`.env`** - Your environment configuration (not tracked in git)
- **`.env.example`** - Template file for other developers
- **`ENV_VARIABLES.md`** - Complete documentation

### 2. Created Configuration File
- **`src/config/api.config.ts`** - Centralized API configuration
  - All service files now import from this single source
  - Uses `VITE_API_BASE_URL` environment variable
  - Provides fallback to `http://localhost:3000`

### 3. Updated Files

#### Configuration
- ✅ `vite.config.ts` - Uses `VITE_PORT` environment variable
- ✅ `src/vite-env.d.ts` - Added TypeScript definitions for env variables
- ✅ `.gitignore` - Added `.env` files to exclusion list

#### Service Files (All updated to use centralized config)
- ✅ `src/services/api.ts`
- ✅ `src/services/comments.api.ts`
- ✅ `src/services/communities.api.ts`
- ✅ `src/services/feed.api.ts`
- ✅ `src/services/friendships.api.ts`
- ✅ `src/services/notifications.api.ts`
- ✅ `src/services/posts.api.ts`
- ✅ `src/services/requests.api.ts`
- ✅ `src/services/search.api.ts`
- ✅ `src/services/suggestions.api.ts`
- ✅ `src/services/user.api.ts`

## 📝 Environment Variables

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000

# Frontend Development Server Port
VITE_PORT=5174
```

## 🎯 How It Works

### Before (Hardcoded):
```typescript
const API_BASE_URL = 'http://localhost:3000'; // ❌ Repeated in every file
```

### After (Centralized):
```typescript
// In src/config/api.config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// In any service file
import { API_BASE_URL } from '../config/api.config'; // ✅ Single source of truth
```

## 🚀 Running the Frontend

### Standard Setup
```bash
cd Front
npm run dev
```

The frontend will:
- Start on port `5174` (or the port specified in `.env`)
- Connect to the API at `http://localhost:3000` (or the URL specified in `.env`)
- Log the API URL in the browser console (development mode only)

### Custom Configuration
To use different ports or API URL, edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_PORT=3001
```

Then restart the dev server.

## 🔧 Integration with Backend

Your backend (from the previous setup) runs on:
- Port: `3000` (configurable via backend `.env`)
- CORS enabled for: `http://localhost:5174`

### If you change the frontend port:
1. Update frontend `.env`:
   ```env
   VITE_PORT=5175
   ```

2. Update backend `.env`:
   ```env
   FRONTEND_URL=http://localhost:5175
   ```

3. Restart both servers

## 📊 Complete Project Configuration

| Component | Port | Configuration File |
|-----------|------|-------------------|
| Frontend Dev Server | 5174 | `Front/.env` → `VITE_PORT` |
| Backend API | 3000 | `back/.env` → `PORT` |
| MongoDB | 38130 | `docker-compose.yml` |
| Neo4j HTTP | 7474 | `docker-compose.yml` |
| Neo4j Bolt | 7687 | `docker-compose.yml` |

## 🎨 Environment Variables by Layer

### Frontend (`Front/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PORT=5174
```

### Backend (`back/.env`)
```env
PORT=3000
FRONTEND_URL=http://localhost:5174
MONGODB_URI=mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password1234
JWT_SECRET=your-secret-key
```

## ⚠️ Important Notes

### Vite Environment Variables
- **Must** be prefixed with `VITE_` to be accessible in client code
- Are embedded at build time (not runtime)
- Require dev server restart when changed

### Security
- Never commit `.env` to git
- Don't expose sensitive data in frontend env variables
- Frontend env variables are visible to users in the browser

### TypeScript
- Type definitions in `src/vite-env.d.ts`
- Auto-completion available in VS Code
- Compile-time type checking

## 🐛 Troubleshooting

### "Failed to fetch" errors?
1. Check backend is running on the correct port
2. Verify `VITE_API_BASE_URL` in frontend `.env`
3. Check browser console for CORS errors
4. Ensure backend `FRONTEND_URL` matches your frontend URL

### Environment variables not updating?
1. Restart the Vite dev server
2. Clear browser cache
3. Check `.env` file location (must be in `Front/` directory)

### Port already in use?
```bash
# Check what's using the port
netstat -ano | findstr :5174

# Change port in .env
VITE_PORT=5175
```

## 📚 Additional Resources

- See `ENV_VARIABLES.md` for detailed documentation
- See `.env.example` for template configuration
- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)

## ✨ Benefits of This Setup

1. **Single Source of Truth** - All API URLs come from one config file
2. **Easy Configuration** - Change ports/URLs in one place (`.env`)
3. **Environment Flexibility** - Different configs for dev/staging/production
4. **Type Safety** - TypeScript knows about your env variables
5. **Team Friendly** - `.env.example` guides other developers
6. **Git Safe** - `.env` is ignored, secrets stay local
