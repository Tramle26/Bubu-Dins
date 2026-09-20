/**
 * Production proxy for the Nessie sandbox.
 *
 * Deploy this alongside the app and set VITE_NESSIE_BASE=/.netlify/functions/nessie
 * so the browser talks https to your own domain and this function talks http to
 * Nessie. Without it, a deployed https build cannot reach the API at all.
 *
 * Bonus: set NESSIE_KEY here as a server-side env var and delete VITE_NESSIE_KEY
 * from the client. The function appends the key, so it never ships to the browser.
 * That is the version to show judges if anyone asks about secrets.
 *
 * Vercel equivalent: rename to api/nessie.js and export a default (req, res) handler.
 */

const NESSIE = 'http://api.nessieisreal.com';

export default async (request, context) => {
  const incoming = new URL(request.url);
  const path = incoming.pathname.replace(/^\/\.netlify\/functions\/nessie/, '') || '/';

  const target = new URL(path, NESSIE);
  for (const [k, v] of incoming.searchParams) target.searchParams.set(k, v);
  if (process.env.NESSIE_KEY) target.searchParams.set('key', process.env.NESSIE_KEY);

  if (!target.searchParams.get('key')) {
    return new Response(JSON.stringify({ message: 'No Nessie key supplied' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    redirect: 'follow',
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/.netlify/functions/nessie/*' };
