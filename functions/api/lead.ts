/**
 * Cloudflare Pages Function — POST /api/lead
 * Reçoit les formulaires du site et les envoie :
 *   1. sur Telegram (bot → conversation du conseiller) ;
 *   2. par e-mail via Resend (copie de sécurité, « répondre » renvoie au voyageur).
 * La demande est acceptée si au moins un des deux canaux a fonctionné.
 *
 * Variables (Cloudflare Pages → Settings → Environment variables) :
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM
 *   ALLOWED_ORIGIN (facultatif, ex. https://www.samarcande-voyage.com)
 */

type Env = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  RESEND_API_KEY?: string;
  LEAD_EMAIL_TO?: string;
  LEAD_EMAIL_FROM?: string;
  ALLOWED_ORIGIN?: string;
};

type Lead = {
  type?: string;
  locale?: string;
  website?: string;
  summary?: string;
  email?: string;
  name?: string;
  page?: string;
  data?: unknown;
};

const TITLES: Record<string, string> = {
  booking: '🧳 Nouvelle demande de réservation',
  contact: '✉️ Nouveau message',
  waitlist: '🔔 Liste d’attente saison suivante',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const origin = request.headers.get('Origin') || '';
  const cors: Record<string, string> = env.ALLOWED_ORIGIN ? { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN } : {};
  if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) return json({ ok: false, error: 'origin' }, 403, cors);

  const raw = await request.text();
  if (raw.length > 20_000) return json({ ok: false, error: 'too_large' }, 413, cors);

  let lead: Lead;
  try { lead = JSON.parse(raw) as Lead; } catch { return json({ ok: false, error: 'bad_json' }, 400, cors); }

  // Robot : on répond « ok » sans rien envoyer.
  if (lead.website) return json({ ok: true }, 200, cors);

  const type = String(lead.type || 'contact');
  const email = String(lead.email || '').trim();
  const summary = String(lead.summary || '').slice(0, 6000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !summary) return json({ ok: false, error: 'invalid' }, 422, cors);

  const title = TITLES[type] || TITLES.contact;
  const meta = `Langue : ${String(lead.locale || '?').toUpperCase()} · Page : ${String(lead.page || '')}`;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const country = (request as Request & { cf?: { country?: string } }).cf?.country || '';

  const results = await Promise.allSettled([
    sendTelegram(env, `<b>${esc(title)}</b>\n\n${esc(summary)}\n\n<i>${esc(meta)}${country ? ` · ${esc(country)}` : ''}</i>`),
    sendEmail(env, {
      subject: `${title} — ${lead.name || email}`,
      text: `${summary}\n\n—\n${meta}\nIP : ${ip} ${country}`,
      replyTo: email,
    }),
  ]);
  const ok = results.some((r) => r.status === 'fulfilled' && r.value === true);
  if (!ok) console.error('lead delivery failed', results);
  return json({ ok }, ok ? 200 : 502, cors);
};

export const onRequestOptions = async ({ env }: { env: Env }) =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

async function sendTelegram(env: Env, html: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: html.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  return res.ok;
}

async function sendEmail(env: Env, m: { subject: string; text: string; replyTo: string }): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_TO) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM || 'Samarcande Voyage <onboarding@resend.dev>',
      to: [env.LEAD_EMAIL_TO],
      reply_to: m.replyTo,
      subject: m.subject,
      text: m.text,
    }),
  });
  return res.ok;
}
