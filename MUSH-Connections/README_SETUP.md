# Development quick start

This repo runs a minimal MUSH social app (backend + frontend) with MongoDB and Neo4j via Docker.

Prerequisites:
- Docker and Docker Compose installed
- (optional) Node/npm if you want to run services locally

1) Copy env templates

- Backend: `cp Backend/.env.example Backend/.env` and edit if needed
- Frontend: `cp Frontend/.env.example Frontend/.env` and edit if needed

2) Start services (fresh DB seed from `mongo-init` will run on first start):

```bash
# from repo root
docker-compose down -v
docker-compose up --build -d
```

3) Verify
- Backend: http://localhost:3000
- Frontend: http://localhost:8080
- Mongo: connect to localhost:38130 with user `mush` / `password1234` (from docker-compose)
- Neo4j Browser: http://localhost:7474 (user neo4j / password1234)

4) Notes on env variables
- Backend reads `PORT`, `MONGO_URI`, `FRONTEND_URL`, `JWT_SECRET` etc via process.env
- Frontend reads `VITE_API_URL` via `import.meta.env.VITE_API_URL` (Vite)

If you prefer seed accounts to be created through the backend (recommended), run a post-start script that calls the registration endpoint so passwords are correctly hashed.

Verifying password hashes
- If you want to verify a plaintext password against a stored bcrypt hash, use the helper script:

	```bash
	# from repo root
	node Backend/scripts/verify-hash.js password123 "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W"
	```

	Exit code 0 means a match, 1 means no match. This is handy to confirm that the hashes in `mongo-init/init-mongo.js` match your expected plaintext.

Verifying JWT tokens
- The backend signs JWTs using the secret configured in `Backend/src/configs/jwt-secret.ts` (or via `JWT_SECRET` env). To verify a token manually:

	```js
	// quick Node snippet
	const jwt = require('jsonwebtoken');
	const token = '<access token here>';
	const secret = process.env.JWT_SECRET || 'if-at-first-you-don\'t-succeed-dust-yourself-off-and-try-again';
	try {
		const payload = jwt.verify(token, secret);
		console.log('valid, payload =', payload);
	} catch (err) {
		console.error('invalid token', err.message);
	}
	```

Security note: move `JWT_SECRET` into `Backend/.env` (not checked into git) and avoid hardcoding secrets in source files.
