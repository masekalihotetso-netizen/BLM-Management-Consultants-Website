# BLM Management Consultants Website

A React/Vite frontend with Firebase-backed enquiry management for BLM Management Consultants.

## Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Fill in the Firebase Web App values in `frontend/.env.local`. Set
`VITE_API_BASE_URL` to the deployed backend URL when the API is hosted
separately. The production output is `frontend/dist`.

Routes are `/`, `/about`, `/services`, `/contact` and `/admin`.

The navigation uses separate HTML pages rather than one long scrolling page.

## Branding
Colors sampled from the supplied visual identity are represented by:
- Deep blue: `#0007AD`
- Bright green: `#00D900`
- White
- Dark navy text

The supplied logo is included at `frontend/assets/blm-logo.jpg`.

## Backend

Requirements: Node.js 20+. XAMPP is not required.

```bash
cd backend
npm install
npm start
```

The backend requires `FIREBASE_SERVICE_ACCOUNT_JSON` and stores enquiries in
Cloud Firestore.

### Node API
- `GET /api/health` — health check
- `POST /api/contact` — receives contact enquiries
- `GET /api/enquiries` — returns saved enquiries for Firebase users with the `admin` custom claim
- `PATCH /api/enquiries/:id` — updates an enquiry status for Firebase users with the `admin` custom claim

## Admin access

1. Enable Email/Password sign-in in Firebase Authentication.
2. Create the administrator user in Firebase Authentication.
3. Set the custom claim from the backend folder using the service-account secret:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content .\service-account.json -Raw
node scripts/set-admin.js admin@example.com
```

The service-account file must stay server-side and must never be placed in
`frontend` or exposed as a `VITE_` variable. Users without the `admin` claim
are signed out of `/admin`, and the backend independently rejects their API
requests with `403`.

## Firebase deployment

```bash
firebase deploy --only hosting,functions,firestore
```

Hosting serves `frontend/dist`, and its SPA rewrite keeps React routes
working on refresh. Build the frontend before deploying.

## Render deployment

The repository includes `render.yaml` for a single Render web service. It builds
the React frontend, starts the Express API, serves the built frontend, and saves
enquiries to Firestore through the Firebase Admin SDK.

1. Push this repository to GitHub or GitLab.
2. In Render, choose **New > Blueprint** and select the repository.
3. Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the complete Firebase service-account
	JSON as a secret environment variable.
4. Deploy. Render will provide the public website URL and `/health` will be the
	service health check.

The frontend and API share the same Render URL, so no `VITE_API_BASE_URL` value
is required for production. Enable Firebase Authentication Email/Password and
create an administrator account before using `/admin`.

## Production checklist
Before public deployment:
- Store the SQLite file on persistent hosting storage, or migrate to a hosted database as traffic grows.
- Keep the Firebase service-account JSON in the backend hosting provider's secret store.
- Add rate limiting, validation and spam protection.
- Enable HTTPS.
- Add the company's official email/social URLs if provided.
- Add privacy and terms pages because the contact form collects customer information.
