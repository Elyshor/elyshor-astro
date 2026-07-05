import autoCovers from '../generated/auto-covers.json';

type CollectionName = 'music' | 'wow' | 'tech' | 'cats';

type CoverData = {
  title?: string;
  coverImage?: string;
  coverAlt?: string;
  coverCredit?: string;
  coverSourceUrl?: string;
  coverProvider?: string;
  coverLicense?: string;
  image?: string;
  heroImage?: string;
  albumCover?: string;
};

type AutoCoverEntry = {
  id: string;
  slug?: string;
  collection: CollectionName;
  imagePath: string;
  alt?: string;
  provider?: string;
  photographer?: string;
  sourceUrl?: string;
  license?: string;
};

export type ResolvedCover = {
  image?: string;
  alt: string;
  credit?: string;
  sourceUrl?: string;
  provider?: string;
  license?: string;
  generated: boolean;
};

const generatedCovers = autoCovers as AutoCoverEntry[];

function findAutoCover(collection: CollectionName, id?: string) {
  if (!id) return undefined;
  return generatedCovers.find((cover) => cover.collection === collection && (cover.id === id || cover.slug === id));
}

function localImagePath(value?: string) {
  if (!value) return undefined;
  return value.startsWith('/assets/img/') || value.startsWith('/images/') ? value : undefined;
}

export function getCoverForPost(collection: CollectionName, id: string | undefined, data: CoverData): ResolvedCover {
  const alt = data.coverAlt || data.title || 'Beitragsbild';
  const manualCover = localImagePath(data.coverImage);

  if (manualCover) {
    return {
      image: manualCover,
      alt,
      credit: data.coverCredit,
      sourceUrl: data.coverSourceUrl,
      provider: data.coverProvider,
      license: data.coverLicense,
      generated: false,
    };
  }

  const autoCover = findAutoCover(collection, id);
  if (autoCover?.imagePath) {
    return {
      image: autoCover.imagePath,
      alt: autoCover.alt || alt,
      credit: autoCover.photographer ? `${autoCover.photographer} / ${autoCover.provider || 'Pexels'}` : autoCover.provider,
      sourceUrl: autoCover.sourceUrl,
      provider: autoCover.provider,
      license: autoCover.license,
      generated: true,
    };
  }

  const legacyImage = localImagePath(data.image) || localImagePath(data.heroImage) || localImagePath(data.albumCover);
  return {
    image: legacyImage,
    alt,
    credit: data.coverCredit,
    sourceUrl: data.coverSourceUrl,
    provider: data.coverProvider,
    license: data.coverLicense,
    generated: false,
  };
}
