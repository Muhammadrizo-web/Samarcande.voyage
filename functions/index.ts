/**
 * Cloudflare Pages Function — « / » : redirection vers la langue du visiteur.
 * Ordre : cookie/choix mémorisé côté client (géré par la page), puis Accept-Language, sinon français.
 */
const LOCALES = ['fr', 'en', 'ru', 'de'] as const;

export const onRequestGet: PagesFunction = async ({ request }) => {
  const header = request.headers.get('Accept-Language') || '';
  const wanted = header
    .split(',')
    .map((part) => {
      const [tag = '', q = 'q=1'] = part.trim().split(';');
      return { lang: tag.slice(0, 2).toLowerCase(), q: Number(q.replace('q=', '')) || 0 };
    })
    .sort((a, b) => b.q - a.q)
    .map((x) => x.lang)
    .find((l) => (LOCALES as readonly string[]).includes(l));
  const url = new URL(request.url);
  url.pathname = `/${wanted || 'fr'}/`;
  return new Response(null, { status: 302, headers: { Location: url.toString(), Vary: 'Accept-Language', 'Cache-Control': 'private, max-age=0' } });
};

type PagesFunction = (ctx: { request: Request }) => Promise<Response> | Response;
