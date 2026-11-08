# StayBy — *Find it. Stay by it.*

StayBy is a purpose- and destination-focused accommodation platform. Instead of
asking only "which city?", it asks **why you are travelling** (medical visit,
education, wedding, pilgrimage, holiday…) and **what you need to be near**
(a hospital, a university, a temple, a beach) — then shows the stays that fit,
best matches first.

Individual full-stack project.

## Roles

| Role | What they can do |
|------|------------------|
| **Traveler** | Search stays by city, landmark, purpose, dates and guests; save favourites; book; pay by card (PayHere) or bank transfer; cancel; review; raise complaints; manage profile |
| **Owner** | List properties and rooms (with photos and map location); hide/show a property; approve or reject bookings; verify bank-transfer payments; handle refunds; see revenue dashboard |
| **Admin** | Verify or reject properties; manage users (suspend/restore); view all bookings; moderate reviews; answer complaints |

Owners register themselves ("List my property"); admin accounts are created
directly in the database.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Leaflet (OpenStreetMap), Lucide icons
- **Backend:** Spring Boot 4, Java 21, Spring Security + JWT, Spring Data JPA
- **Database:** PostgreSQL
- **Payments:** PayHere (card), manual bank transfer with receipt upload
- **Extras:** PDF payment slips (PDFBox), e-mail (verification and password reset)

## Highlights

- Relevance-ranked search: city, landmark and purpose are scored; stays that match
  everything are listed first, all other stays after them
- Automatic "important places nearby" (hospitals, universities, beaches, temples…)
- Booking lifecycle: request → owner approval → payment → confirmed → completed,
  with automatic expiry of unanswered or unpaid bookings
- Role-based access enforced on both the website and the API
- Mobile-friendly, consistent design; pages load on demand for faster start-up

## Running it locally

### Requirements
Java 21, Node.js 20+, PostgreSQL.

### 1. Database
Create an empty PostgreSQL database (for example `stayby`). Tables are created
automatically on first start.

### 2. Backend
Settings live in `application.properties` and/or environment variables
(a `.env` file is read in development). The settings you need to provide:

| Setting | Meaning |
|---------|---------|
| database url / username / password | your PostgreSQL connection |
| `stayby.jwt.secret` | long random secret used to sign login tokens |
| `stayby.jwt.expiration` | login token lifetime |
| `stayby.frontend-url` | address of the website (used for CORS and PayHere return pages), e.g. `http://localhost:5173` |
| `payhere.merchant-id`, `payhere.merchant-secret` | from your PayHere account |
| `payhere.notify-url` | public address PayHere calls after a payment: `https://<public-address>/api/payments/payhere/notify` |
| `payhere.sandbox` | `true` for testing, `false` for real payments |
| mail settings | SMTP account used to send verification and reset codes |
| `stayby.booking.pending-expiry-hours` (optional, default 48) | unanswered requests are rejected after this long |
| `stayby.booking.payment-expiry-hours` (optional, default 24) | approved but unpaid bookings are cancelled after this long |
| `spring.servlet.multipart.max-file-size=6MB`, `max-request-size=30MB` | upload limits |

Start it:

```
cd backend
./mvnw spring-boot:run
```

(on Windows PowerShell: `.\mvnw spring-boot:run`) — it listens on port 8080.

### 3. Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The backend address defaults to
`http://localhost:8080`; to change it create `frontend/.env` with
`VITE_API_URL=...` (see `.env.example`).

Optional: set `VITE_SUPPORT_EMAIL` in `frontend/.env` to turn on the contact
form on the Contact page (the address is never shown on the page). Without it,
the page points visitors to Complaints.

### 4. First admin account
Register a normal account, then in the database set its role to `ADMIN`
(for example `UPDATE users SET role = 'ADMIN' WHERE email = '...';`).

### Testing card payments locally
PayHere must reach your backend from the internet. Run `ngrok http 8080`,
copy the `https://….ngrok-free.dev` address and set
`payhere.notify-url=https://<that-address>/api/payments/payhere/notify`
(the value must contain only the address), then restart the backend. A free
ngrok address changes every time ngrok restarts. Test cards are listed in
PayHere's sandbox documentation.

## If you host it later
- Use a new random `stayby.jwt.secret`, a strong database password and HTTPS
- Set `stayby.frontend-url` to the real website address and `VITE_API_URL`
  to the real backend address
- `payhere.notify-url` must be a permanent public address, and
  `payhere.sandbox=false` only after PayHere approves a live account
- Photos live in the `uploads/` folder, which many hosts wipe on restart —
  use persistent disk or cloud storage
- Back up the database
- The static host must send unknown paths to `index.html`

Build commands:
```
cd frontend && npm run build      # outputs frontend/dist
cd backend && ./mvnw clean package && java -jar target/*.jar
```

## Known limitations

- Login tokens already issued stay valid until they expire, even after a
  password change or reset
- Brute-force limits (5 wrong attempts per 15 minutes) cover login, password
  reset and change-password; the counters are kept in memory and reset when the
  backend restarts
- Nearby-place distances are straight-line, not driving distance, and rely on the
  public OpenStreetMap services, which are sometimes busy
- Admin accounts are created manually in the database
- Photos are stored on the server's disk (not cloud storage)

## Project structure

```
StayBy/
├─ backend/    Spring Boot API (controller, service, repository, entity, security)
└─ frontend/   React app (pages, components, services)
```