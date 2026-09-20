# Storyworld scene — Opening day at the bank

The playable version of lesson activity 3.5. Bubu sits down with **Tram**, a new-accounts
associate, opens checking and savings, decides whether to take a student credit card, and then
lives one month with the result. Every account, purchase, transfer and payment is a real Capital
One Nessie call.

```
bank-scene.html   the page (self-contained: no build step, no framework)
bank-scene.js     scenario data + engine + Nessie client
scene.jpg         the bank illustration
tram.jpg          Tram's chat avatar
bubu.jpg          Bubu's chat avatar
```

```
serve.mjs                    standalone dev server + Nessie proxy
bank-scene.config.js         local key, gitignored
bank-scene.config.example.js the committed copy, blank
```

## Running it

```bash
node src/storyworld/serve.mjs      # → http://localhost:5174
```

That serves the folder and proxies `/nessie/*` to the API, adding the key **server-side** — so the
key never reaches the browser and never appears in client code. It reads the key from `NESSIE_KEY`
or from `bank-scene.config.js`, and redacts it in the request log.

Opening `bank-scene.html` straight off disk also works. There is no proxy that way, so the scene
runs on its practice bank and says so in the status pill.

### The other way, if you need it

The scene reads two globals, so it drops into any host page with no bundler:

```html
<script>
  window.__NESSIE_BASE__ = '/nessie';
  window.__NESSIE_KEY__  = 'your-sandbox-key';   // only for local work
</script>
<script type="module" src="./bank-scene.js"></script>
```

Prefer the proxy. A key in a client script is a key in your build output, and your `AGENTS.md`
rules that out.

**The https catch, again.** `api.nessieisreal.com` is plain http and its https URL redirects back to
http, so a browser on an https page blocks every call silently. `serve.mjs` handles it locally,
`vite.config.js` handles it for the lesson, and `netlify/functions/nessie.js` handles it in
production.

### Unverified

None of these calls has run against the live API — the machine this was built on blocks the host —
so the field names come from Nessie's SDK sources, not from a response anyone has seen. Run
`node scripts/nessie-probe.mjs <key>` before you trust one. The likeliest mismatch is the accepted
`type` on `POST /accounts/{id}/loans`; the scene surfaces a rejection rather than swallowing it.

## Which API calls the scene makes

| Moment | Call |
| --- | --- |
| Opening the accounts | `POST /customers`, then `POST /customers/{id}/accounts` for Checking and Savings, with the split the player chose |
| Taking the card | `POST /customers/{id}/accounts` with `type: "Credit Card"` |
| Week 1–3 spending | `POST /accounts/{id}/purchases` on whichever account the player picked |
| Pulling from the cushion | `POST /accounts/{savingsId}/transfers` into checking |
| Statement day | `GET /customers/{id}/accounts` — the balances are read back, not remembered |
| Paying the statement | `POST /accounts/{cardId}/withdrawals` and the same amount out of checking |

Nessie stores one unsigned `balance` per account and models no credit line, so on a Credit Card that
balance is read as **money owed**: purchases raise it and a payment is a *withdrawal*. That mapping
is in one place, `mockBank.createPurchase` and the payment beat, and it matches the lesson's
`portfolioFromAccounts()`.

## Editing the script

`SCENARIOS` is data. Five beat types:

- `say` — Tram speaks, then the scene moves on
- `choose` — the player picks a line. An option can `set` flags, `spend` on an account, `transfer`
  between accounts, `teaches` a concept, pay `credits`, and carry a `when` guard so it only appears
  if earlier choices allow it
- `ask` — the free-question loop, gated on `min` questions before the player may continue
- `api` — a real bank call, rendered as a receipt showing the actual request
- `debrief` — what was learned, and the credits for it

`KB` holds the questions Tram can answer from memory, each with `keys` for matching typed input.
Add an entry and it appears in the suggestion rotation automatically.

## "Ask your own question"

Typed questions are matched against `KB.keys` first — instant and free. Anything that doesn't match
goes to Claude via the artifact `sample` capability, prompted to answer **as Tram** under
`TRAM_BRIEF`: 2–4 sentences, plain language, and explicitly barred from telling the student what to
do with their own money, recommending products, or predicting returns. If the capability isn't
available or the viewer declines, Tram says she'd rather not guess and points at the list — which is
the honest failure mode rather than a made-up answer.

Outside the artifact platform there is no `window.claude`, so in your app that path is a no-op
unless you point `sampleFn` at your own Dr. Bos endpoint. That's one line in `boot()`.
