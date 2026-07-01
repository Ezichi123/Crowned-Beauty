## Deposit Page Flow — Current Setup & Upgrade Path

### Current setup (free Cal.com plan)

Cal.com's native **"Redirect on booking"** feature (found under an event
type's **Confirmation** tab) requires a paid plan. We're on the free plan,
so instead of relying on Cal.com to redirect the user after a real booking,
the site redirects the user to `deposit.html` **immediately when they pick
a stylist** — before they've actually booked on Cal.com. The deposit page
then gives them a button to go complete the booking, and shows the Cash App
deposit info at the same time.

**Where this lives:** `client/js/booking.js`, inside `confirmStylistBooking()`.

```javascript
const url = `${base}/${slug}?notes=${encodeURIComponent(notes)}`;

localStorage.setItem('pendingBooking', JSON.stringify({
  stylist,
  style: serviceLabel,
  addons: chosenAddons.map(a => `${a.name} ($${a.price})`),
  total,
  deposit,
  depositPercent,
  calcomUrl: url,   // the actual Cal.com booking link
}));

closeStylistPicker();
window.location.href = 'deposit.html'; // navigate straight to the deposit page
```

`deposit.html` reads `pendingBooking` from `localStorage` on load, renders
the summary + deposit amount + Cash App tag, AND shows a
**"COMPLETE YOUR BOOKING HERE →"** button that links to `calcomUrl` (opens
in a new tab, via `target="_blank"`). Since the user hasn't actually booked
yet at this point, the page copy says **"ALMOST THERE!"** and explicitly
tells them to complete the booking first, then send the deposit.

### If/when the Cal.com plan is upgraded

Once redirect-on-booking is available on your plan, the flow gets simpler —
Cal.com will handle sending the user to the deposit page itself, but only
*after* they've actually completed a real booking (more reliable than the
current workaround).

**Step 1 — Turn it on in Cal.com**
For each event type (Full Braiding Service, Twists/Locs, Cornrow
Hairstyles, and Alexia's events once she's set up) →
**Confirmation tab** → enable **"Redirect to a custom URL after a
successful booking"** → set the URL to:
- Local dev: `http://localhost:4000/deposit.html`
- Production: `https://yourdomain.com/deposit.html`

**Step 2 — Update `confirmStylistBooking()` in `client/js/booking.js`**
Replace the ending of the function:

```javascript
closeStylistPicker();
window.location.href = 'deposit.html';
```

with:

```javascript
closeStylistPicker();
window.open(url, '_blank'); // user books here — Cal.com redirects THIS tab to deposit.html on success
```

Everything above that line (building `notes`, saving `pendingBooking` to
`localStorage`, including `calcomUrl`) stays exactly the same — no changes
needed there.

**Step 3 — Simplify `deposit.html`**
Since the user will now only land on this page *after* a real confirmed
booking, remove the "complete your booking" button and instructional text,
and flip the copy back to reflect a completed booking:

- Remove this block entirely (the button is no longer needed):
  ```javascript
  ${b.calcomUrl ? `
    <a href="${b.calcomUrl}" target="_blank" rel="noopener" class="hero-cta" style="display:inline-block;margin-bottom:2rem">
      COMPLETE YOUR BOOKING HERE →
    </a>
  ` : ''}
  ```
- Remove or simplify this line:
  ```javascript
  <p style="font-size:.8rem;color:rgba(245,237,216,.6);margin-bottom:1rem;line-height:1.7">
    Complete your booking below, then send your deposit to lock in your appointment.
  </p>
  ```
  → change to something like: `"Send your deposit below to secure your appointment."`
- In the static HTML above the script, change:
  - `"ALMOST THERE!"` → `"YOU'RE BOOKED!"`
  - `"Finish booking, then secure your spot"` → `"Let's secure your spot"`

**Nothing else changes.** The `pendingBooking` object shape, the summary
card rendering, the Cash App tag lookup, and the deposit % calculation all
stay identical — this is purely a routing + copy change, not a rebuild.

### Quick reference: how to tell which mode you're in

- If `deposit.html` shows "ALMOST THERE!" with a booking button → you're on
  the current (free-plan) workaround.
- If it shows "YOU'RE BOOKED!" with no button → you've completed the
  upgrade switch above.