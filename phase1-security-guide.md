# Phase 1 — Security Quick Wins
### Examen2 project · Step-by-step guide

These 5 fixes can be done in order, one at a time. Each one is independent — if you
finish fix 1 and get stuck, the app still works. You don't need to understand everything
deeply, just follow each section carefully.

---

## Fix 1 — Move the database password out of the code

### Why this matters
Right now the password `Sergio12` is sitting in `db/db.js` on a **public** GitHub repo.
Anyone in the world can read it. Even if you delete it today, it will still exist in the
git history. This fix moves the password into a separate file that git will never touch.

### Step 1 · Install the dotenv package
Open a terminal in your project root folder (where `package.json` lives) and run:

```bash
npm install dotenv
```

`dotenv` is a tiny package that reads a `.env` file and makes its contents available to
your code as `process.env.VARIABLE_NAME`. That's its only job.

---

### Step 2 · Create the .env file
In the project root (same folder as `server.js`), create a new file called exactly `.env`
(note the dot at the start). Paste this into it:

```
DB_USER=postgres
DB_PASSWORD=Sergio12
DB_NAME=inventario
DB_HOST=localhost
DB_PORT=5432
PORT=3005
```

This file is your "secrets file". It lives on your machine only and never goes to GitHub.

---

### Step 3 · Tell git to ignore the .env file
Open `.gitignore` (already exists in the project root) and add this line at the very bottom:

```
.env
```

After adding it, the file should look like this at the end:

```
# System files
.DS_Store
Thumbs.db

# Environment variables — NEVER commit this
.env
```

> **Important:** If you've already committed `.env` by accident, run this command to remove
> it from git's tracking (it will stay on your disk):
> ```bash
> git rm --cached .env
> ```

---

### Step 4 · Update db.js to use the .env variables
Replace the **entire contents** of `db/db.js` with this:

```js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  max:      10
});

pool.connect((err, connection) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL:', err.message);
    return; // Don't crash the server, just log it
  }
  console.log('Conexion exitosa con el gestor de BD PostgreSQL');
  connection.release();
});

module.exports = pool;
```

**What changed and why:**
- `require('dotenv').config()` — loads the `.env` file so `process.env.DB_PASSWORD` etc. work
- `process.env.DB_PASSWORD` instead of `"Sergio12"` — reads the value from the secret file
- `if (err) { console.error(...); return; }` instead of `throw err` — if the database is
  slow to start, the server no longer crashes. It just logs a warning and keeps running.
- The two broken import lines at the top (`const {connection} = require("pg")` etc.) are
  removed — they did nothing useful.

---

### Step 5 · Update server.js to use the PORT from .env
In `server.js`, line 4 currently reads:

```js
const port = process.env.port || 3005
```

Change `port` (lowercase) to `PORT` (uppercase):

```js
const port = process.env.PORT || 3005
```

On Linux and Mac, environment variables are case-sensitive. `process.env.port` is always
`undefined` on those systems, so the `.env` setting was being silently ignored.

---

### How to verify Fix 1 worked
Restart your server (`nodemon` will do it automatically if it's running, otherwise
`node server.js`). You should see:

```
El servidor se encuentra corriendo en el puerto: 3005
Conexion exitosa con el gestor de BD PostgreSQL
```

If you see that, the credentials are loading correctly from `.env`. ✓

---
---

## Fix 2 — Add security headers with helmet

### Why this matters
By default, Express sends no security instructions to the browser. This leaves the door
open for a few classic attacks:

- **Clickjacking** — a malicious website embeds your app in an invisible iframe and tricks
  users into clicking things they can't see.
- **MIME sniffing** — the browser might decide an uploaded file is a script and execute it.
- **Missing HTTPS enforcement** — browsers won't automatically upgrade to HTTPS.

`helmet` fixes all of these with one line. It's the industry standard for Express apps.

### Step 1 · Install helmet
```bash
npm install helmet
```

### Step 2 · Add it to server.js
Open `server.js`. Add `require('helmet')` at the top with the other requires, then add
`app.use(helmet())` as the **very first** `app.use()` call — before cors, before
bodyParser, before everything else. Order matters here.

Your `server.js` should look like this after the change:

```js
require('dotenv').config();                          // ← ADD (load .env first)
const express    = require('express');
const helmet     = require('helmet');                // ← ADD
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const app  = express();
const port = process.env.PORT || 3005;

app.use(helmet());                                   // ← ADD (must be first)
app.use(cors({ origin: 'http://localhost:4200' }))  // ← CHANGE (restrict cors)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

const controller = require('./controller/controller');
app.use(controller);

app.listen(port, () => {
  console.log(`El servidor se encuentra corriendo en el puerto: ${port}`);
});
```

**What also changed:** `app.use(cors())` became `app.use(cors({ origin: 'http://localhost:4200' }))`.
The original `cors()` with no options allowed **any** website to talk to your API. Now only
your Angular dev server (port 4200) is allowed. When you deploy to production, change
`localhost:4200` to your real domain.

### How to verify Fix 2 worked
Restart the server and open your browser's DevTools (F12) → Network tab → click any API
request → look at the Response Headers. You should now see headers like:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
```

If those appear, helmet is working. ✓

---
---

## Fix 3 — Add rate limiting to the login endpoint

### Why this matters
Without rate limiting, someone can try thousands of passwords per second against any
account. The bcrypt hashing slows each attempt down, but not enough to stop a sustained
attack. Rate limiting says "after 10 failed attempts from the same IP address, block that
IP for 15 minutes."

### Step 1 · Install express-rate-limit
```bash
npm install express-rate-limit
```

### Step 2 · Add it to controller.js
Open `controller/controller.js`. At the very top, with the other `require` statements
(around lines 1-9), add this:

```js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,              // max 10 attempts per IP per window
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { verificacion: false, mensaje: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});
```

**What this does:** `windowMs` is the time window (15 minutes in milliseconds). `max: 10`
means after 10 requests from the same IP in that window, every subsequent request gets
a 429 error with your custom message instead of being processed.

### Step 3 · Apply the limiter only to the login route
Find the login route (around line 32). Add `loginLimiter` as the second argument:

```js
// BEFORE:
router.post("/api/login", async (req, res) => {

// AFTER:
router.post("/api/login", loginLimiter, async (req, res) => {
```

That's the only change to the route itself. Just insert `, loginLimiter,` between the
path string and `async`.

> **Why only apply it to login?** You don't want to rate-limit normal page navigation.
> The login endpoint is the specific target because it's where password guessing happens.

### How to verify Fix 3 worked
You can test this quickly by opening a terminal and running the following 11 times in a
row (or writing a quick loop). After the 10th attempt, you should get the rate limit
message instead of the normal "Correo o contraseña incorrectos":

```bash
curl -X POST http://localhost:3005/api/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@test.com","password":"wrong"}'
```

On the 11th attempt you'll see:
```json
{"verificacion":false,"mensaje":"Demasiados intentos. Intenta de nuevo en 15 minutos."}
```
✓

---
---

## Fix 4 — Remove debug console.logs that leak sensitive data

### Why this matters
There are 4 `console.log` statements left in the code from debugging. They print the
admin's session data and the full request body to the browser console. Anyone sitting at
a computer where the app is open can press F12 and read this information. They're also
just noise that makes real errors harder to spot.

### What to do
Open `src/app/components/pedidos/pedidos.component.ts`.

Find and **delete** these 4 lines entirely (don't replace them with anything, just delete):

**Lines 54-56** (they look like this):
```ts
console.log('sesion:', sesion);
console.log('idAdmin:', this.idAdmin);
console.log('idPlantelAdmin:', this.idPlantelAdmin); // 👈 necesito ver este valor
```

**Lines 112-117** (they look like this):
```ts
console.log('Body que se envía al backend:', { // 👈 necesito ver este valor
  id_pedido: this.pedidoSeleccionado.id_pedido,
  estado,
  id_usuario_admin: this.idAdmin,
  id_plantel_admin: this.idPlantelAdmin
});
```

After deleting, the code around line 54 should flow directly from the session assignment
to the next line of logic with no console.log in between. Same for the block around 112.

### How to verify Fix 4 worked
Open the app in the browser, go to the pedidos (admin orders) section, and perform any
action. Open DevTools → Console tab. You should see **no** output mentioning `sesion`,
`idAdmin`, or `Body que se envía al backend`. ✓

---
---

## Fix 5 — Add file upload validation to multer

### Why this matters
The current setup lets anyone upload any type of file (including scripts) to your server,
and they get served back as static files. This fix adds two protections:
1. **MIME type check** — only actual image files (jpg, png, webp) are accepted
2. **File size limit** — files over 2MB are rejected before they're even saved to disk

### What to do
Open `controller/controller.js`. Find the multer setup (around lines 16-23):

```js
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'imagenes/') },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
```

Replace that entire block with this:

```js
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'imagenes/') },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Only use the extension we validated — NOT the user's original filename
    const ext = {
      'image/jpeg': '.jpg',
      'image/png':  '.png',
      'image/webp': '.webp'
    }[file.mimetype];
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // accept the file
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false); // reject it
  }
};

const upload = multer({
  storage:    storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024  // 2 MB maximum
  }
});
```

**What changed and why:**
- `fileFilter` — a function that runs before saving. It checks `file.mimetype` (which the
  operating system determines, not the user). If it's not in the allowed list, the file is
  rejected with an error message before a single byte is written to disk.
- `limits: { fileSize: 2 * 1024 * 1024 }` — rejects files larger than 2MB. `2 * 1024 * 1024`
  is just 2 megabytes in bytes.
- The filename extension now comes from the validated mimetype map, not from the user's
  original filename. This prevents someone from uploading `shell.php` and keeping the `.php`
  extension.

### Handle the new error in the plantel route
When multer rejects a file, it throws an error that needs to be caught. Find the plantel
creation route (around line 217):

```js
router.post("/api/plantel", upload.single('imagen'), async (req, res) => {
```

And update it to handle the multer error:

```js
router.post("/api/plantel", (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ mensaje: err.message });
    }
    next();
  });
}, async (req, res) => {
```

> This looks more complex but the idea is simple: we wrap multer's upload in a small
> function so that if it throws (e.g. "file too large" or "wrong type"), we catch it and
> return a clean JSON error instead of crashing.

### How to verify Fix 5 worked
Try uploading a `.txt` or `.pdf` file through the plantel creation form. It should be
rejected with the message "Solo se permiten imágenes JPG, PNG o WEBP". Uploading a normal
`.jpg` should still work fine. ✓

---
---

## Summary — what you've done

| Fix | File(s) changed | What it protects against |
|-----|----------------|--------------------------|
| 1 · Move credentials to .env | `db/db.js`, `.gitignore`, new `.env` | Password exposed in public repo |
| 2 · Add helmet + restrict CORS | `server.js` | Clickjacking, MIME sniffing, open CORS |
| 3 · Rate limit login | `controller/controller.js` | Brute force password attacks |
| 4 · Remove console.logs | `pedidos.component.ts` | Session data leaking in browser console |
| 5 · Validate file uploads | `controller/controller.js` | Malicious file uploads |

**After completing all 5**, commit and push. Then move on to Phase 2 (JWT authentication)
— that's the big one that makes the server actually enforce who can do what.
