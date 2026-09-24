'use client';

import { useEffect, useState } from 'react';

/**
 * Date « courante » : celle du build pour le premier rendu (HTML identique à
 * l'hydratation), puis la vraie date du visiteur. Les départs passés
 * disparaissent donc même si le site n'a pas été reconstruit.
 */
export function useNow(buildNow: number): number {
  const [now, setNow] = useState(buildNow);
  useEffect(() => setNow(Date.now()), []);
  return now;
}
