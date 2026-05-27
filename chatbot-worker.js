/**
 * Cloudflare Worker — Portfolio Chat API
 *
 * SETUP:
 * 1. Workers & Pages → Create Worker → paste this file → Deploy
 * 2. Settings → Bindings → Add → Workers AI (variable name: AI)
 * 3. Settings → Variables → Add variable (encrypted): SYSTEM_PROMPT → paste system-prompt.txt
 * 4. Settings → Variables → Add variable (encrypted): CORS_ORIGIN → your GitHub Pages URL
 * 5. Copy the worker URL into chatbot-widget.js as WORKER_URL
 */

const FALLBACK = "I can't reach the assistant right now. Please try again in a moment or contact Arturo directly via the contact form.";

const _rates = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const r = _rates.get(ip);
  if (!r || now - r.ts > RATE_WINDOW) { _rates.set(ip, { n: 1, ts: now }); return false; }
  if (r.n >= RATE_LIMIT) return true;
  r.n++;
  return false;
}

function headers(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const origin = env.CORS_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: headers(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('{"error":"Method not allowed"}', { status: 405, headers: headers(origin) });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response('{"error":"Too many requests. Please wait a moment."}', { status: 429, headers: headers(origin) });
    }

    let body;
    try { body = await request.json(); } catch {
      return new Response('{"error":"Invalid JSON"}', { status: 400, headers: headers(origin) });
    }

    const { messages, context } = body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('{"error":"No messages provided"}', { status: 400, headers: headers(origin) });
    }
    const last = messages[messages.length - 1];
    if (last?.role !== 'user' || typeof last.content !== 'string') {
      return new Response('{"error":"Last message must be user role"}', { status: 400, headers: headers(origin) });
    }
    if (last.content.length > 1200) {
      return new Response('{"error":"Message too long"}', { status: 400, headers: headers(origin) });
    }
    if (messages.length > 20) {
      return new Response('{"error":"Too many messages in history"}', { status: 400, headers: headers(origin) });
    }

    const systemPrompt = env.SYSTEM_PROMPT || '';
    const systemContent = context
      ? `${systemPrompt}\n\n## RELEVANT SITE CONTENT\n${context}`
      : systemPrompt;

    try {
      const ai = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: systemContent },
          ...messages.slice(-10),
        ],
        max_tokens: 512,
        temperature: 0.5,
      });
      return new Response(JSON.stringify({ reply: ai.response || FALLBACK }), { headers: headers(origin) });
    } catch (err) {
      console.error('AI error:', err);
      return new Response(JSON.stringify({ reply: FALLBACK }), { headers: headers(origin) });
    }
  },
};
