# 🍄 MUSH Social Network - Complete Environment Setup

This guide covers the complete environment variable configuration for the entire MUSH project.

## 📁 Project Structure

```
red-social-mush/
├── docker-compose.yml          # MongoDB & Neo4j containers
├── back/                       # NestJS Backend
│   ├── .env                   # Backend environment variables
│   ├── .env.example           # Backend template
│   └── SETUP_COMPLETE.md      # Backend setup guide
├── Front/                      # React Frontend
│   ├── .env                   # Frontend environment variables
│   ├── .env.example           # Frontend template
│   └── SETUP_COMPLETE.md      # Frontend setup guide
└── mongo-init/
```

## 🚀 Quick Start

### 1. Start Docker Services (MongoDB & Neo4j)
```bash
cd red-social-mush
docker-compose up -d
```

Verify containers are running:
```bash
docker ps
```

You should see:
- `mush-mongodb` on port 38130
- `mush-neo4j` on ports 7474 and 7687

### 2. Start Backend
```bash
cd back
npm install          # First time only
npm run start:dev
```

Backend will start on: `http://localhost:3000`

### 3. Start Frontend
```bash
cd Front
npm install          # First time only
npm run dev
```

Frontend will start on: `http://localhost:5174`

## 🔧 Environment Configuration

### Backend (`back/.env`)

```env
# Application
PORT=3000
FRONTEND_URL=http://localhost:5174

# MongoDB
MONGODB_URI=mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password1234

# JWT
JWT_SECRET=if-at-first-you-don't-succeed-dust-yourself-off-and-try-again

# Optional: Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

### Frontend (`Front/.env`)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000

# Frontend Dev Server Port
VITE_PORT=5174
```

## 📊 Complete Port Reference

| Service | Default Port | Environment Variable | Config File |
|---------|--------------|---------------------|-------------|
| Frontend Dev | 5174 | `VITE_PORT` | `Front/.env` |
| Backend API | 3000 | `PORT` | `back/.env` |
| MongoDB | 38130 | Part of `MONGODB_URI` | `back/.env` + `docker-compose.yml` |
| Neo4j HTTP | 7474 | - | `docker-compose.yml` |
| Neo4j Bolt | 7687 | Part of `NEO4J_URI` | `back/.env` + `docker-compose.yml` |

## 🎯 Common Configuration Scenarios

### Scenario 1: Change Frontend Port

**Problem:** Port 5174 is already in use

**Solution:**
1. Edit `Front/.env`:
   ```env
   VITE_PORT=5175
   ```

2. Edit `back/.env`:
   ```env
   FRONTEND_URL=http://localhost:5175
   ```

3. Restart both servers

### Scenario 2: Change Backend Port

**Problem:** Port 3000 is already in use

**Solution:**
1. Edit `back/.env`:
   ```env
   PORT=4000
   ```

2. Edit `Front/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

3. Restart both servers

### Scenario 3: Deploy to Production

**Backend `.env.production`:**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/database?authSource=admin
NEO4J_URI=bolt://your-neo4j-host:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=secure-password
JWT_SECRET=very-secure-random-string
```

**Frontend `.env.production`:**
```env
VITE_API_BASE_URL=https://api.your-backend-domain.com
```

## 🐛 Troubleshooting

### Registration/Login fails with "Failed to fetch"

**Checklist:**
1. ✅ MongoDB container is running (`docker ps`)
2. ✅ Backend is running and connected to MongoDB (check backend console)
3. ✅ Frontend `VITE_API_BASE_URL` matches backend URL
4. ✅ Backend `FRONTEND_URL` matches frontend URL
5. ✅ No CORS errors in browser console

**Common Issues:**

#### MongoDB Connection Refused
```bash
# Check MongoDB is running
docker ps | findstr mongodb

# Check MongoDB logs
docker logs mush-mongodb

# Restart MongoDB
docker-compose restart mongodb-service
```

#### CORS Error
Ensure backend `.env` has:
```env
FRONTEND_URL=http://localhost:5174
```

And it matches your actual frontend URL.

#### Environment Variables Not Working

**Backend:**
- Make sure `.env` is in `back/` directory
- Restart backend server after changing `.env`
- Check for typos in variable names

**Frontend:**
- Make sure `.env` is in `Front/` directory
- Variables **must** start with `VITE_`
- Restart Vite dev server after changing `.env`
- Check browser console for logged API URL

### Database Connection Issues

#### MongoDB
```bash
# Test connection from host
docker exec -it mush-mongodb mongosh -u mush -p password1234 --authenticationDatabase admin

# Inside mongosh:
show dbs
use redsocial
show collections
```

#### Neo4j
- Open browser: http://localhost:7474
- Username: `neo4j`
- Password: `password1234`

## 🔐 Security Best Practices

### Development
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Never commit `.env` files
- ✅ Keep `.env.example` updated for team members

### Production
- ⚠️ Use strong, unique passwords
- ⚠️ Use environment-specific secrets
- ⚠️ Enable MongoDB authentication
- ⚠️ Use HTTPS for all connections
- ⚠️ Use secret management services (AWS Secrets Manager, Azure Key Vault, etc.)

## 📝 Setup Checklist

- [ ] Docker installed and running
- [ ] Node.js installed (v16+ recommended)
- [ ] MongoDB container running (`docker ps`)
- [ ] Neo4j container running (`docker ps`)
- [ ] Backend `.env` file created and configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend running without errors
- [ ] Frontend `.env` file created and configured
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running and can reach backend
- [ ] Can register a new user
- [ ] Can login successfully

## 📚 Additional Documentation

- **Backend Setup:** `back/SETUP_COMPLETE.md`
- **Backend Env Vars:** `back/ENV_VARIABLES.md`
- **Frontend Setup:** `Front/SETUP_COMPLETE.md`
- **Frontend Env Vars:** `Front/ENV_VARIABLES.md`

## 🎉 Summary

All ports and URLs are now centralized in `.env` files:

✅ **Backend** - All configs in `back/.env`
✅ **Frontend** - All configs in `Front/.env`
✅ **Easy to change** - Edit one file, restart server
✅ **Team friendly** - `.env.example` files for guidance
✅ **Secure** - `.env` files never committed to git
✅ **Flexible** - Different configs per environment

Your MUSH Social Network is ready to run! 🍄
