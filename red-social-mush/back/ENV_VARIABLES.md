# Environment Variables Configuration

This document describes all the environment variables used in the MUSH Social Network backend.

## Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration.

## Environment Variables

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment (development, production, test) | `development` | No |
| `PORT` | Port on which the backend server runs | `3000` | No |
| `FRONTEND_URL` | URL of the frontend application for CORS | `http://localhost:5174` | Yes |

### MongoDB Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | Full MongoDB connection string | `mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin` | Yes |
| `MONGODB_HOST` | MongoDB host | `localhost` | No* |
| `MONGODB_PORT` | MongoDB port | `38130` | No* |
| `MONGODB_USERNAME` | MongoDB username | `mush` | No* |
| `MONGODB_PASSWORD` | MongoDB password | `password1234` | No* |
| `MONGODB_DATABASE` | MongoDB database name | `redsocial` | No* |
| `MONGODB_AUTH_SOURCE` | MongoDB authentication database | `admin` | No* |

*These are included for reference but `MONGODB_URI` is the primary configuration used.

### Neo4j Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEO4J_URI` | Neo4j connection URI | `bolt://localhost:7687` | Yes |
| `NEO4J_HOST` | Neo4j host | `localhost` | No* |
| `NEO4J_PORT` | Neo4j port | `7687` | No* |
| `NEO4J_USERNAME` | Neo4j username | `neo4j` | Yes |
| `NEO4J_PASSWORD` | Neo4j password | `password1234` | Yes |

### JWT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | (see configs/jwt-secret.ts) | Yes |
| `JWT_EXPIRATION` | JWT token expiration time | `24h` | No |

### Cloudinary Configuration (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | Yes (if using Cloudinary) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | Yes (if using Cloudinary) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | Yes (if using Cloudinary) |

### Email Configuration (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` | Yes (if using email) |
| `EMAIL_PORT` | SMTP server port | `587` | Yes (if using email) |
| `EMAIL_USER` | Email account username | - | Yes (if using email) |
| `EMAIL_PASSWORD` | Email account password | - | Yes (if using email) |
| `EMAIL_FROM` | Default sender email address | `"MUSH Social Network <noreply@mush.com>"` | Yes (if using email) |

### File Upload Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MAX_FILE_SIZE` | Maximum file size for uploads | `50mb` | No |

## Docker Configuration

When running MongoDB and Neo4j in Docker (as per docker-compose.yml), the ports are:
- MongoDB: `38130` (mapped from container port 27017)
- Neo4j HTTP: `7474`
- Neo4j Bolt: `7687`

## Notes

- Never commit the `.env` file to version control
- Keep `.env.example` updated when adding new environment variables
- For production, use secure values and consider using a secret management service
- The default MongoDB and Neo4j passwords should be changed in production

## Example Connection Strings

### MongoDB
```
mongodb://username:password@host:port/database?authSource=admin
```

### Neo4j
```
bolt://host:port
```
