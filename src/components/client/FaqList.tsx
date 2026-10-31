'use client';

import { useId, useState } from 'react';
import { Plus } from '../Icons';

/**
 * FAQ en accordéon : une seule réponse ouverte à la fois.
 * En deux colonnes, chaque colonne est une pile indépendante : ouvrir une
 * question ne décale jamais les questions de l'autre colonne.
 * Le texte des réponses reste dans le HTML (référencement).
 */
export function FaqList({ items, cols }: { items: { q: string; a: string }[]; cols?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const cut = cols ? Math.ceil(items.length / 2) : items.length;
  const columns = cols ? [items.slice(0, cut), items.slice(cut)] : [items];

  // data-rv est posé sur la colonne (classe figée) : React ne réécrit pas sa
  // classe, donc l'animation d'apparition n'est pas effacée à chaque ouverture.
  return (
    <div className={`faq${cols ? ' faq--cols' : ''}`}>
      {columns.map((col, c) => (
        <div className="faq__col" data-rv="" key={c}>
          {col.map((f, j) => {
            const i = c * cut + j;
            const isOpen = open === i;
            return (
              <div key={i} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                <h3 className="faq__q">
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="day__chev" aria-hidden><Plus /></span>
                  </button>
                </h3>
                <div className="faq__body" id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`}>
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
