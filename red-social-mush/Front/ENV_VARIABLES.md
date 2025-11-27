# Frontend Environment Variables

This document describes all environment variables used in the MUSH Social Network frontend.

## Important: Vite Environment Variables

Vite uses a special prefix system for environment variables:
- Only variables prefixed with `VITE_` are exposed to your client-side code
- Variables without the `VITE_` prefix are only available in `vite.config.ts`

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update values in `.env` as needed

3. Restart the development server after changing `.env` variables

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` | Yes |
| `VITE_PORT` | Frontend dev server port | `5174` | No |

## Configuration Files

### `src/config/api.config.ts`
Centralized configuration for API calls. All service files import `API_BASE_URL` from here.

### `.env`
Your local environment configuration (not committed to git)

### `.env.example`
Template for environment variables (committed to git)

## Usage in Code

### Accessing Environment Variables

```typescript
// ✅ Correct - Using the centralized config
import { API_BASE_URL } from '../config/api.config';

// ❌ Incorrect - Don't access directly in service files
const url = import.meta.env.VITE_API_BASE_URL;
```

### In Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
  }
})
```

## Development vs Production

### Development (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PORT=5174
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

## TypeScript Support

Type definitions are in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
}
```

## Troubleshooting

### Environment variables not working?

1. **Make sure variables are prefixed with `VITE_`**
   - ✅ `VITE_API_BASE_URL`
   - ❌ `API_BASE_URL`

2. **Restart the dev server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

3. **Check the browser console**
   - In development, the API URL is logged on startup

4. **Verify the file location**
   - `.env` must be in the `Front/` directory (same level as `package.json`)

### Port already in use?

Change `VITE_PORT` in `.env`:
```env
VITE_PORT=5175
```

Then restart the dev server.

## Notes

- Never commit `.env` to git (already in `.gitignore`)
- Keep `.env.example` updated when adding new variables
- Environment variables are embedded at build time
- Changing `.env` requires a dev server restart
