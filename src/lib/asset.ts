/** Préfixe les fichiers de /public avec le basePath éventuel (aperçus hébergés dans un sous-dossier). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (path: string) => `${BASE}${path}`;
