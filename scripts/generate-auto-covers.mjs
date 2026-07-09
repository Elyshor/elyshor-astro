import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const contentRoot = path.join(rootDir, 'src', 'content');
const generatedDir = path.join(rootDir, 'public', 'assets', 'img', 'covers', 'generated');
const generatedJsonPath = path.join(rootDir, 'src', 'generated', 'auto-covers.json');
const collections = ['music', 'wow', 'tech', 'cats'];
const refresh = process.argv.includes('--refresh');

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!existsSync(envPath)) return;

  try {
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...parts] = trimmed.split('=');
      if (process.env[key]) continue;
      process.env[key] = parts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  } catch (error) {
    console.warn(`[auto-covers] .env konnte nicht gelesen werden: ${error.message}`);
  }
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed.replace(/^["']|["']$/g, '');
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  const lines = match[1].split(/\r?\n/);
  let activeArray;

  for (const line of lines) {
    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && activeArray) {
      data[activeArray].push(parseScalar(arrayItem[1]));
      continue;
    }

    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;

    const [, key, rawValue] = field;
    if (rawValue.trim() === '') {
      data[key] = [];
      activeArray = key;
    } else {
      data[key] = parseScalar(rawValue);
      activeArray = undefined;
    }
  }

  return data;
}

async function readMarkdownFiles(collection) {
  const dir = path.join(contentRoot, collection);
  if (!existsSync(dir)) return [];

  const found = [];
  const walk = async (currentDir) => {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        found.push(entryPath);
      }
    }
  };

  await walk(dir);
  return found;
}

function buildQueries(collection, post) {
  const tags = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).toLowerCase()) : [];
  const title = typeof post.title === 'string' ? post.title.toLowerCase() : '';
  const tagText = `${tags.join(' ')} ${title}`;
  const hasAny = (needles) => needles.some((needle) => tagText.includes(needle));

  if (collection === 'music') {
    if (hasAny(['dreamz', 'dream', 'ambient', 'chill'])) {
      return ['dreamy landscape', 'ethereal nature', 'misty forest', 'cinematic landscape'];
    }

    if (hasAny(['night', 'night creatures'])) {
      return ['night forest', 'moonlit landscape', 'night landscape', 'cinematic night landscape'];
    }

    if (hasAny(['young soul', 'soul'])) {
      return ['warm landscape', 'sunset landscape', 'lonely road sunset', 'mountain lake'];
    }

    if (hasAny(['house', 'techno', 'electronic', 'synth', 'garage'])) {
      return ['neon night landscape', 'city lights night', 'cinematic night landscape', 'mountain lake'];
    }

    return ['dreamy landscape', 'misty forest', 'cinematic landscape', 'sunset landscape', 'ethereal nature'];
  }

  if (collection === 'wow') {
    if (hasAny(['wow', 'fantasy', 'gilde', 'powerpuffpeons'])) {
      return ['fantasy landscape', 'misty mountains', 'enchanted forest', 'cinematic landscape'];
    }

    return ['fantasy landscape', 'misty forest', 'mountain lake', 'enchanted forest'];
  }

  if (collection === 'tech') {
    if (hasAny(['tech', 'setup', 'website', 'astro', 'content'])) {
      return ['abstract landscape', 'minimal futuristic landscape', 'blue technology landscape', 'cinematic landscape'];
    }

    return ['abstract dreamy landscape', 'minimal futuristic landscape', 'blue technology landscape'];
  }

  if (collection === 'cats') {
    return ['cozy home cat', 'sleepy cat', 'cat home', 'cute cat'];
  }

  return ['abstract dreamy landscape'];
}

function stableIndex(seed, length) {
  if (length <= 1) return 0;
  const hash = createHash('sha1').update(seed).digest('hex');
  return Number.parseInt(hash.slice(0, 8), 16) % length;
}

async function loadGeneratedJson() {
  try {
    if (!existsSync(generatedJsonPath)) return [];
    return JSON.parse(await readFile(generatedJsonPath, 'utf8'));
  } catch (error) {
    console.warn(`[auto-covers] auto-covers.json konnte nicht gelesen werden: ${error.message}`);
    return [];
  }
}

async function saveGeneratedJson(entries) {
  await mkdir(path.dirname(generatedJsonPath), { recursive: true });
  await writeFile(generatedJsonPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

function hasManualCover(post) {
  return typeof post.coverImage === 'string' && post.coverImage.trim().length > 0;
}

function entryExists(entries, collection, id) {
  return entries.find((entry) => entry.collection === collection && entry.id === id && entry.imagePath);
}

function publicImageExists(imagePath) {
  if (!imagePath) return false;
  return existsSync(path.join(rootDir, 'public', imagePath.replace(/^\//, '')));
}

async function searchPexels(apiKey, query) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '12');
  url.searchParams.set('size', 'medium');

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      'User-Agent': 'Elyshor auto cover generator',
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels ${response.status} fuer "${query}"`);
  }

  return response.json();
}

async function downloadImage(url, targetPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Bilddownload fehlgeschlagen: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(targetPath, bytes);
}

async function main() {
  loadDotEnv();
  await mkdir(generatedDir, { recursive: true });
  await mkdir(path.dirname(generatedJsonPath), { recursive: true });

  const apiKey = process.env.PEXELS_API_KEY;
  const entries = await loadGeneratedJson();
  let changed = false;

  if (!apiKey) {
    console.warn('[auto-covers] PEXELS_API_KEY fehlt. Vorhandene generierte Cover werden genutzt, sonst greifen Fallbacks.');
    await saveGeneratedJson(entries);
    return;
  }

  for (const collection of collections) {
    const files = await readMarkdownFiles(collection);

    for (const filePath of files) {
      const source = await readFile(filePath, 'utf8');
      const post = parseFrontmatter(source);
      if (post.draft === true || hasManualCover(post)) continue;

      const id = slugify(path.basename(filePath, path.extname(filePath)));
      const existing = entryExists(entries, collection, id);
      if (!refresh && existing && publicImageExists(existing.imagePath)) continue;

      const queries = buildQueries(collection, post);
      const query = queries[stableIndex(`${collection}-${id}-${(post.tags || []).join('-')}`, queries.length)];

      try {
        const result = await searchPexels(apiKey, query);
        const photos = Array.isArray(result.photos) ? result.photos : [];
        if (!photos.length) {
          console.warn(`[auto-covers] Kein Pexels-Treffer fuer ${collection}/${id} (${query})`);
          continue;
        }

        const photo = photos[stableIndex(`${collection}-${id}`, photos.length)];
        const imageUrl = photo?.src?.landscape || photo?.src?.large2x || photo?.src?.large || photo?.src?.medium;
        if (!imageUrl) continue;

        const fileName = `${collection}-${id}.jpg`;
        const targetPath = path.join(generatedDir, fileName);
        await downloadImage(imageUrl, targetPath);

        const nextEntry = {
          id,
          slug: id,
          collection,
          imagePath: `/assets/img/covers/generated/${fileName}`,
          alt: `${post.title || collection} - generisches freies Coverbild`,
          provider: 'Pexels',
          photographer: photo.photographer || '',
          sourceUrl: photo.url || '',
          license: 'Pexels License',
          query,
        };

        const index = entries.findIndex((entry) => entry.collection === collection && entry.id === id);
        if (index >= 0) entries[index] = nextEntry;
        else entries.push(nextEntry);
        changed = true;
        console.log(`[auto-covers] Cover erzeugt: ${collection}/${id} (${query})`);
      } catch (error) {
        console.warn(`[auto-covers] ${collection}/${id}: ${error.message}`);
      }
    }
  }

  if (changed || !existsSync(generatedJsonPath)) {
    entries.sort((a, b) => `${a.collection}/${a.id}`.localeCompare(`${b.collection}/${b.id}`));
    await saveGeneratedJson(entries);
  }
}

main().catch((error) => {
  console.warn(`[auto-covers] Unerwarteter Fehler: ${error.message}`);
  process.exitCode = 0;
});
