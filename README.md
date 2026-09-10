# BLM Management Consultants Website

A responsive multi-page full-stack website based on the supplied BLM Management Consultants branding and service information.

## Pages
- `/` or `frontend/index.html` — Home
- `/about.html` — About
- `/services.html` — Services
- `/contact.html` — Contact / enquiry form

The navigation uses separate HTML pages rather than one long scrolling page.

## Branding
Colors sampled from the supplied visual identity are represented by:
- Deep blue: `#0007AD`
- Bright green: `#00D900`
- White
- Dark navy text

The supplied logo is included at `frontend/assets/blm-logo.jpg`.

## Run with Node.js and SQLite
Requirements: Node.js 18+ recommended. XAMPP is not required.

```bash
cd backend
npm install
npm start
```

Then open:

`http://localhost:5000`

The Express server serves both the frontend and the API. SQLite is created
automatically at `backend/data/enquiries.sqlite`.

### Node API
- `GET /api/health` — health check
- `POST /api/contact` — receives contact enquiries
- `GET /api/enquiries` — returns saved enquiries (starter-project endpoint; protect this before production)

## Production checklist
Before public deployment:
- Store the SQLite file on persistent hosting storage, or migrate to a hosted database as traffic grows.
- Protect the enquiries endpoint with authentication/authorization.
- Add rate limiting, validation and spam protection.
- Enable HTTPS.
- Add the company's official email/social URLs if provided.
- Add privacy and terms pages because the contact form collects customer information.
