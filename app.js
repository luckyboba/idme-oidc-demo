import express from "express";
import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

// ---- config from env (Render: Environment tab) ----
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI, // must EXACTLY match the portal entry
  AUTH_URL = "https://api.id.me/oauth/authorize",
  TOKEN_URL = "https://api.id.me/oauth/token",
  ISSUER = "https://api.id.me/oidc",
  PORT = process.env.PORT || 10000,
} = process.env;

const app = express();

// quick healthcheck
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// keep states in-memory (fine for a demo)
const validStates = new Set();

// ---------- home ----------
app.get("/", (_req, res) => {
  res.type("html").send(`
    <h1>ID.me OIDC Demo</h1>
    <p><a href="/login">Verify with ID.me</a></p>
  `);
});

// ---------- start login ----------
app.get("/login", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  validStates.add(state);

  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);   // EXACT match required
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "query");       // be explicit
  url.searchParams.set("scope", "openid login");
  url.searchParams.set("state", state);

  console.log("➡️ Redirecting to:", url.toString());
  res.redirect(url.toString());
});

// ---------- callback ----------
app.get("/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  console.log("↩️  /callback query:", req.query);

  if (error) {
    return res
      .status(400)
      .type("text")
      .send(`OIDC error: ${error}${error_description ? " — " + error_description : ""}`);
  }

  if (!code) {
    return res
      .status(400)
      .type("text")
      .send("Missing ?code — did you refresh this page, open it directly, or click Deny?");
  }

  if (!state || !validStates.has(state)) {
    return res.status(400).type("text").send("State mismatch/expired");
  }
  validStates.delete(state);

  // Exchange code for tokens
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const tokenResp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResp.ok) {
    const txt = await tokenResp.text();
    return res.status(500).type("text").send(`Token exchange failed:\n${txt}`);
  }

  const tokens = await tokenResp.json();
  const { id_token } = tokens;

  // Verify ID token
  const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
  let verified;
  try {
    verified = await jwtVerify(id_token, JWKS, {
      issuer: ISSUER,
      audience: CLIENT_ID,
    });
  } catch (e) {
    return res.status(500).type("text").send(`ID token verification failed:\n${e}`);
  }

  // Render result
  res.type("html").send(`
    <h1>Authentication Success</h1>
    <h2>Tokens</h2>
    <pre>${escapeHtml(JSON.stringify(tokens, null, 2))}</pre>
    <h2>ID Token Claims (verified)</h2>
    <pre>${escapeHtml(JSON.stringify(verified.payload, null, 2))}</pre>
    <p><a href="/">Back</a></p>
  `);
});

// tiny helper to avoid HTML injection in <pre>
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));}

app.listen(PORT, "0.0.0.0", () => console.log("✅ listening on", PORT));


