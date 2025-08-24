import express from "express";
import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();

// ====== CONFIG (use env vars in hosting platform) ======
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g., https://yourapp.onrender.com/callback

const ISSUER = "https://api.id.me/oidc";
const AUTH_URL = "https://api.id.me/oauth/authorize";
const TOKEN_URL = "https://api.id.me/oauth/token";
const JWKS = createRemoteJWKSet(new URL("https://api.id.me/oidc/.well-known/jwks"));

// ====== ROUTES ======


app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Community Discounts • ID.me Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="color-scheme" content="light dark">
  <style>
    /* Subtle card shadow + smooth hover */
    .card{box-shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06)}
    .card:hover{transform:translateY(-2px);box-shadow:0 10px 15px rgba(0,0,0,.08),0 4px 6px rgba(0,0,0,.06)}
  </style>
</head>
<body class="bg-white text-gray-900 antialiased [--accent:#2db262] dark:bg-zinc-950 dark:text-zinc-50">
  <!-- Header -->
  <header class="border-b border-zinc-200/70 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <a class="font-semibold tracking-tight text-lg" href="/">Your Store</a>
      <nav class="hidden sm:flex gap-6 text-sm">
        <a class="hover:opacity-70" href="#how">How it works</a>
        <a class="hover:opacity-70" href="#faq">FAQs</a>
      </nav>
      <a href="/login" class="inline-flex items-center gap-2 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-white font-medium shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40">
        <!-- id.me-ish shield -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="opacity-90"><path d="M12 2l7 3v6c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z"/></svg>
        Verify with ID.me
      </a>
    </div>
  </header>

  <!-- Hero -->
  <section class="relative">
    <div class="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-950 -z-10"></div>
    <div class="max-w-6xl mx-auto px-4 py-14 sm:py-20">
      <div class="max-w-2xl">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Community discounts</h1>
        <p class="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          Verify your status as a military member, first responder, healthcare worker, teacher or student with ID.me to unlock exclusive savings.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/login" class="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 text-white font-semibold shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="opacity-90"><path d="M12 2l7 3v6c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z"/></svg>
            Verify with ID.me
          </a>
          <a href="#how" class="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900">
            Learn how it works
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Community cards -->
  <section class="max-w-6xl mx-auto px-4 pb-12">
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${[
        {title:"Military & Veterans",icon:`<path d="M12 2l3 3-3 3-3-3 3-3zm7 7l3 3-3 3-3-3 3-3zM5 9l3 3-3 3-3-3 3-3zm7 7l3 3-3 3-3-3 3-3z"/>`},
        {title:"First Responders",icon:`<path d="M12 2l7 7-7 13L5 9l7-7z"/>`},
        {title:"Healthcare & Nurses",icon:`<path d="M10 2h4v4h4v4h-4v4h-4v-4H6V6h4V2z"/>`},
        {title:"Teachers",icon:`<path d="M3 6l9-4 9 4-9 4-9-4zm0 6l9 4 9-4v6l-9 4-9-4v-6z"/>`},
        {title:"Students",icon:`<path d="M12 3l9 5-9 5-9-5 9-5zm0 7l6 3-6 3-6-3 6-3z"/>`},
        {title:"Seniors",icon:`<path d="M12 2a5 5 0 110 10 5 5 0 010-10zm-7 18a7 7 0 0114 0H5z"/>`}
      ].map(c => `
      <article class="card rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] grid place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${c.icon}</svg>
          </div>
          <h3 class="text-lg font-semibold">${c.title}</h3>
        </div>
        <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Quick verification with ID.me. Returning members sign in and get the benefit applied automatically.</p>
        <div class="mt-4">
          <a href="/login" class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Verify now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5l7 7-7 7v-4H4v-6h9V5z"/></svg>
          </a>
        </div>
      </article>
      `).join("")}
    </div>
  </section>

  <!-- How it works -->
  <section id="how" class="max-w-6xl mx-auto px-4 py-12">
    <h2 class="text-2xl font-bold tracking-tight">How it works</h2>
    <ol class="mt-4 grid sm:grid-cols-3 gap-4">
      <li class="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
        <div class="text-xs font-semibold text-zinc-500">Step 1</div>
        <div class="mt-1 font-medium">Verify with ID.me</div>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Sign in and confirm your status (e.g., military, nurse, teacher).</p>
      </li>
      <li class="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
        <div class="text-xs font-semibold text-zinc-500">Step 2</div>
        <div class="mt-1 font-medium">Return to your cart</div>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">We validate the tokens and apply your discount or access automatically.</p>
      </li>
      <li class="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
        <div class="text-xs font-semibold text-zinc-500">Step 3</div>
        <div class="mt-1 font-medium">Checkout with savings</div>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Enjoy your benefit. No need to re-verify every time.</p>
      </li>
    </ol>
  </section>

  <!-- FAQ -->
  <section id="faq" class="max-w-6xl mx-auto px-4 pb-16">
    <h2 class="text-2xl font-bold tracking-tight">FAQs</h2>
    <div class="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      ${[
        {q:"Who’s eligible?", a:"Military, first responders, healthcare workers, teachers and students (based on program rules)."},
        {q:"Do I need to re-verify each time?", a:"Usually no. After your one-time verification, you can sign in with ID.me to carry your status."},
        {q:"What data do you store?", a:"We use standard OpenID Connect tokens and map minimal claims to your account (e.g., eligibility flag). We don’t store your documents."}
      ].map((x,i)=>`
      <details class="group p-5">
        <summary class="flex cursor-pointer items-center justify-between font-medium list-none">
          <span>${x.q}</span>
          <svg class="transition group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15l-6-6h12l-6 6z"/></svg>
        </summary>
        <div class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">${x.a}</div>
      </details>`).join("")}
    </div>
  </section>

  <footer class="border-t border-zinc-200/70 dark:border-zinc-800 text-sm">
    <div class="max-w-6xl mx-auto px-4 py-8 text-zinc-500">Demo site for interview • Built with Express + Tailwind</div>
  </footer>
</body>
</html>`);
});


app.get("/login", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid login"); // OIDC requires 'openid' + your requested scope
  url.searchParams.set("state", state);
  res.redirect(url.toString());

});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing ?code");

  const body = new URLSearchParams({
    code: code.toString(),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code"
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const tokenJson = await tokenRes.json();

  const { id_token } = tokenJson;
  let claims = {};
  try {
    const verified = await jwtVerify(id_token, JWKS, { issuer: ISSUER, audience: CLIENT_ID });
    claims = verified.payload;
  } catch (e) {
    claims = { error_verifying_id_token: e.message };
  }

  res.type("html").send(`
    <h1>Authentication Success</h1>
    <h2>Tokens</h2>
    <pre>${escapeHtml(JSON.stringify(tokenJson, null, 2))}</pre>
    <h2>ID Token Claims (verified)</h2>
    <pre>${escapeHtml(JSON.stringify(claims, null, 2))}</pre>
    <a href="/">Back</a>
  `);
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}


const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log('listening on', port));
