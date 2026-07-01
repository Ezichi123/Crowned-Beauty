# Crowned Beauty 👑

Where braids meet backend. A custom booking platform built for a two-stylist
hair braiding business — dynamic pricing, live add-ons, smart stylist
matching, and seamless scheduling.

**Stack:** HTML/CSS/Vanilla JS frontend · Node.js + Express backend ·
MongoDB Atlas · Cloudinary · Cal.com

---

## What this is

A full-stack website for **Crowned Beauty**, run by **Ezichi** and
**Alexia**. Clients can browse services, build out an appointment with
add-ons, see a live running total, get routed to the correct stylist's
Cal.com booking page for that specific service, and pay a non-refundable
Cash App deposit to secure their spot — all without either stylist needing
to touch code to manage their menu, pricing, or gallery.

---

## Features

### Client-facing
- **Interactive service menu** — Category → Style → Size → Length, with
  live price display. Prices can be flat (per size) or split by length
  option (e.g. Mid-back / Butt Length / Thigh Length).
- **Stylist-aware service tags** — each style shows whether it's offered by
  Ezichi, Alexia, or both. Selecting a style filters which stylist card is
  active/inactive accordingly.
- **Add-ons section** — checkbox-based extras (braiding hair, curls, etc.)
  that add to the running total live as they're selected.
- **Booking summary** — shows the selected service, chosen add-ons, and
  total price before the client commits to booking.
- **Book Now → stylist picker modal** — routes the client to the correct
  Cal.com event for the stylist and service they selected. Whichever
  stylist doesn't offer that service is disabled in the picker.
- **Location matching** — "Use My Location" button calculates distance
  (Haversine formula) from the client to each stylist and shows who's
  closer.
- **Per-stylist portfolio galleries** — image/video galleries with a
  lightbox viewer, media hosted on Cloudinary.
- **Deposit page** — after booking, the client is shown their service
  summary, deposit amount owed (a configurable % of total), and the
  correct stylist's Cash App tag to send it to.

### Admin panel (password-protected, hidden route — see note below)
- **Service Menu Editor** — full CRUD on categories, styles, sizes, and
  length options, plus per-style stylist assignment (Ezichi / Alexia /
  Both). Changes save to MongoDB immediately.
- **Add-Ons Editor** — add, rename, reprice, activate/deactivate add-ons.
- **Booking Event Mapping** — maps each category to a specific Cal.com
  event slug, per stylist, plus each stylist's Cal.com base URL.
- **Deposit Settings** — set deposit percentage and each stylist's Cash App
  tag.
- **Stylist Locations** — set/update lat-lng coordinates per stylist (with
  a "use my current location" convenience button), used by the client-side
  distance feature.
- **Gallery management** — upload/delete portfolio images and videos per
  stylist.
- **Business info & booking links** — contact details and fallback Cal.com
  profile URLs.
- **Rate-limited login** — repeated failed login attempts are throttled.

---

## Booking → Payment Flow (current implementation)

```
Client selects service + add-ons → sees running total
        ↓
Clicks "Book Now" → stylist picker modal
        ↓
Picks a stylist (disabled if that stylist doesn't offer the selected service)
        ↓
Redirected to deposit.html, which shows:
  - Service + add-ons summary
  - Total price
  - Deposit amount due
  - A "Complete Your Booking Here →" button linking to the correct
    Cal.com event (opens in a new tab)
  - The stylist's Cash App tag + non-refundable deposit notice
        ↓
Client completes booking on Cal.com, then sends the Cash App deposit
```

**Why it works this way:** Cal.com's native "redirect after successful
booking" feature requires a paid plan. The current free-plan workaround
sends the client to the deposit page *before* they've finished booking on
Cal.com, with a button to complete that booking — rather than Cal.com
redirecting them there *after*. Full details on this, and exactly what to
change if/when the Cal.com plan is upgraded, are documented inline in
`client/js/booking.js` (see `confirmStylistBooking()`) and in
`client/deposit.html`.

---

## Project structure

```
crowned-beauty/
├── client/
│   ├── index.html               → Main site
│   ├── deposit.html             → Post-booking deposit page
│   ├── css/styles.css           → All styling (espresso/gold theme)
│   ├── js/
│   │   ├── config.js            → API base URL, booking link defaults
│   │   ├── api.js               → Fetch wrapper (GET/POST/PUT/DELETE/upload)
│   │   ├── services.js          → Category/style/size rendering, add-ons,
│   │   │                          booking summary calculation
│   │   ├── gallery.js           → Gallery modal + lightbox
│   │   ├── booking.js           → Stylist cards, location matching,
│   │   │                          stylist picker, Cal.com routing
│   │   ├── admin.js             → Admin panel + all editors
│   │   └── main.js              → Boot sequence
│   └── assets/
│       ├── logos/
│       └── favicon/
│
├── server/
│   ├── server.js                → Express entry point
│   ├── config/db.js             → MongoDB connection
│   ├── middleware/auth.js       → JWT auth for admin routes
│   ├── models/
│   │   ├── Category.js
│   │   ├── GalleryItem.js
│   │   └── Setting.js           → Generic key/value settings store
│   ├── routes/
│   │   ├── auth.js              → /api/auth/login (rate-limited)
│   │   ├── categories.js        → /api/categories
│   │   ├── gallery.js           → /api/gallery + Cloudinary upload
│   │   └── settings.js          → /api/settings/* — business info,
│   │                               booking links, stylist locations,
│   │                               add-ons, category-event mapping,
│   │                               calcom base URLs, deposit settings
│   └── seed.js                  → Populates DB with starter menu
│
├── .env                          → Secrets — never committed
├── .env.example                  → Template, safe to commit
├── .gitignore
└── package.json
```

---

## Environment variables

Defined in `.env` (never committed — see `.env.example` for the template):

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 4000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Signs admin auth tokens |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login credentials |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Gallery media hosting |
| `CLIENT_URL` | Used for CORS — should match wherever the frontend is served from |

---

## Data that lives in MongoDB (not in code)

Everything editable via the admin panel is stored as documents in MongoDB,
not hardcoded — this means the "defaults" baked into `services.js`
(`DEFAULT_CATEGORIES`) are only a fallback for first load / offline demo,
and are **not** what the live site actually serves once the database is
connected and seeded:

- Categories → Styles → Sizes → Lengths (with prices)
- Add-ons
- Category → Cal.com event slug mapping, per stylist
- Cal.com base URLs, per stylist
- Deposit percentage + Cash App tags, per stylist
- Stylist coordinates (for location matching)
- Business contact info
- Gallery items (Cloudinary URLs + metadata)

---

## Security notes

- Admin login is rate-limited (throttles repeated failed attempts).
- The admin panel is reached via a non-obvious URL path rather than a
  visible on-page button — **that path is intentionally not documented
  here or anywhere in the public repo.** Keep it recorded somewhere
  private (password manager, local gitignored note).
- Admin write routes (`PUT /categories`, `PUT /settings/*`, etc.) require a
  valid JWT, obtained only via successful login.
- `.env` (and therefore all credentials/secrets) is gitignored and must
  never be committed.

---

## Known limitations / future work

- **Cal.com deposit redirect** currently uses a workaround (client-side
  redirect before booking completes) because the native "redirect after
  booking" feature requires a paid Cal.com plan. See
  `client/js/booking.js` and `client/deposit.html` for the exact swap to
  make if/when upgraded.
- **Deposit confirmation is manual** — Cash App has no public API, so
  there's no automated "deposit received" confirmation. Stylists check
  Cash App directly; Cal.com's own notification serves as the booking
  alert.
- No customer accounts / booking history — all state is per-session
  (`localStorage`) until a booking is completed.

---

Built with Node.js, Express, MongoDB & vanilla JS. 👑