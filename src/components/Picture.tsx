import { IMAGES, type ImageName } from '@/content/images.generated';
import { asset } from '@/lib/asset';

type Props = {
  name: ImageName;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Position de recadrage CSS (object-position) */
  position?: string;
};

/**
 * <picture> AVIF → WebP → JPEG, largeurs multiples, flou de chargement (LQIP).
 * Les fichiers sont produits par `npm run images`.
 */
export function Picture({ name, alt, sizes = '100vw', priority, className, position }: Props) {
  const meta = IMAGES[name];
  const set = (ext: string) => meta.widths.map((w) => `${asset(`/img/${name}-${w}.${ext}`)} ${w}w`).join(', ');
  const fallbackW = meta.widths.find((w) => w >= 1200) ?? meta.widths[meta.widths.length - 1];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={asset(`/img/${name}-${fallbackW}.jpg`)}
        srcSet={set('jpg')}
        sizes={sizes}
        width={meta.w}
        height={meta.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        style={{ backgroundImage: `url(${meta.lqip})`, backgroundSize: 'cover', objectPosition: position }}
      />
    </picture>
  );
}
