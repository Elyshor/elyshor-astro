export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hasTag(tags: string[] = [], expected: string) {
  const expectedSlug = slugifyTag(expected);
  return tags.some((tag) => slugifyTag(tag) === expectedSlug);
}

export function hasAnyTag(tags: string[] = [], expected: string[]) {
  return expected.some((tag) => hasTag(tags, tag));
}

export function tagHref(tag: string) {
  const slug = slugifyTag(tag);
  const sectionHrefs: Record<string, string> = {
    musik: '/musik/',
    music: '/musik/',
    wow: '/wow/',
    powerpuffpeons: '/powerpuffpeons/',
    setup: '/setup-technik/',
    technik: '/setup-technik/',
    tech: '/setup-technik/',
    katzen: '/katzen/',
    cats: '/katzen/',
  };

  return sectionHrefs[slug] || `/tags/${slug}/`;
}
