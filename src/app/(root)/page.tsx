import { LOCALES, LOCALE_META } from '@/lib/i18n';

/**
 * « / » : redirige vers la langue du navigateur (ou le choix mémorisé), français par défaut.
 * Sur Cloudflare Pages, public/_redirects fait la même chose côté serveur pour les robots.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const SCRIPT = `(function(){var L=${JSON.stringify(LOCALES)},b=${JSON.stringify(BASE)},l='fr';try{var s=localStorage.getItem('sv-lang');if(s&&L.indexOf(s)>-1){l=s}else{var n=(navigator.languages||[navigator.language||'fr']);for(var i=0;i<n.length;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(L.indexOf(c)>-1){l=c;break}}}}catch(e){}location.replace(b+'/'+l+'/')})();`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${BASE}/fr/`} />
      </noscript>
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: 40, textAlign: 'center' }}>
        <p>Samarcande Voyage</p>
        <p>
          {LOCALES.map((l) => (
            <a key={l} href={`${BASE}/${l}/`} hrefLang={l} style={{ margin: '0 10px' }}>{LOCALE_META[l].label}</a>
          ))}
        </p>
      </main>
    </>
  );
}
