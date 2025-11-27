# 🚀 MUSH Backend - Environment Variables Setup Complete

## ✅ What Was Done

### 1. Created Environment Files
- **`.env`** - Your actual environment configuration (not tracked in git)
- **`.env.example`** - Template file for other developers
- **`ENV_VARIABLES.md`** - Complete documentation of all environment variables

### 2. Updated Application Files

#### `src/main.ts`
- ✅ Port now uses `PORT` environment variable (default: 3000)
- ✅ Frontend URL uses `FRONTEND_URL` environment variable (default: http://localhost:5174)
- ✅ Max file size uses `MAX_FILE_SIZE` environment variable (default: 50mb)

#### `src/app.module.ts`
- ✅ MongoDB connection uses `MONGODB_URI` environment variable
- ✅ Falls back to: `mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin`

#### `src/Neo4J/neo4j.module.ts`
- ✅ Already using `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` environment variables
- ✅ Falls back to: `bolt://localhost:7687`, username: `neo4j`, password: `password1234`

#### `src/configs/jwt-secret.ts`
- ✅ JWT secret now uses `JWT_SECRET` environment variable

#### `src/cloudinary/cloudinary.config.ts`
- ✅ Already using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### `src/email/email.service.ts`
- ✅ Already using `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

## 📝 Environment Variables Summary

### Required for Basic Operation
```env
PORT=3000
FRONTEND_URL=http://localhost:5174
MONGODB_URI=mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password1234
JWT_SECRET=your-secret-key
```

### Optional (for additional features)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

## 🎯 How to Use

### First Time Setup
1. The `.env` file has been created with working defaults
2. Update any values you need to change
3. Start your application normally

### For Other Developers
1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
2. Update the values in `.env`
3. Never commit `.env` to git (already in `.gitignore`)

## 🔧 Running the Project

### Start Docker Services (MongoDB & Neo4j)
```bash
cd c:\Users\sncji\Documents\GitHub\.uni\BASES DE DATOS NO RELACIONALES\U-BDN-Taller-MUSH-Connections\red-social-mush
docker-compose up -d
```

### Start Backend
```bash
cd back
npm run start:dev
```

### Start Frontend
```bash
cd Front
npm run dev
```

## 📊 Port Configuration

| Service | Port | Environment Variable |
|---------|------|---------------------|
| Backend API | 3000 | `PORT` |
| Frontend | 5174 | `FRONTEND_URL` |
| MongoDB | 38130 | Part of `MONGODB_URI` |
| Neo4j HTTP | 7474 | - |
| Neo4j Bolt | 7687 | Part of `NEO4J_URI` |

## ⚠️ Important Notes

1. **Never commit `.env`** - It contains sensitive credentials
2. **Keep `.env.example` updated** - When adding new variables
3. **Change default passwords** - For production environments
4. **JWT Secret** - Use a strong, unique secret in production

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify Docker container is running: `docker ps`
- Check MongoDB logs: `docker logs mush-mongodb`
- Ensure port 38130 is not in use by another application

### Neo4j Connection Issues
- Verify Docker container is running: `docker ps`
- Check Neo4j logs: `docker logs mush-neo4j`
- Test connection at http://localhost:7474

### Backend Won't Start
- Check `.env` file exists in `back/` directory
- Verify all required environment variables are set
- Check for typos in connection strings

## 📚 Additional Resources

- See `ENV_VARIABLES.md` for detailed documentation of all variables
- See `.env.example` for template configuration
