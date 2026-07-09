type GradientInput = {
  collection?: string;
  tags?: string[];
  title?: string;
  artist?: string;
  track?: string;
};

type Palette = {
  match: string[];
  light: string;
  dark: string;
};

const palettes: Palette[] = [
  {
    match: ['electronic', 'house', 'techno', 'dance', 'club', 'musik'],
    light: 'radial-gradient(circle at 18% 14%, rgba(154, 180, 232, 0.56), transparent 34%), radial-gradient(circle at 82% 24%, rgba(204, 137, 166, 0.48), transparent 36%), linear-gradient(135deg, #f4dfd8 0%, #d9cee7 48%, #b7c8df 100%)',
    dark: 'radial-gradient(circle at 18% 14%, rgba(85, 102, 160, 0.44), transparent 34%), radial-gradient(circle at 82% 24%, rgba(159, 86, 126, 0.36), transparent 38%), linear-gradient(135deg, #21162d 0%, #3a233d 48%, #1f3148 100%)',
  },
  {
    match: ['young soul', 'soul', 'chill', 'lofi', 'soft', 'dreamy'],
    light: 'radial-gradient(circle at 22% 20%, rgba(255, 196, 139, 0.58), transparent 35%), radial-gradient(circle at 78% 28%, rgba(190, 139, 176, 0.44), transparent 38%), linear-gradient(135deg, #f6d7be 0%, #dec0d2 50%, #c5cfe1 100%)',
    dark: 'radial-gradient(circle at 22% 20%, rgba(208, 126, 87, 0.32), transparent 35%), radial-gradient(circle at 78% 28%, rgba(174, 99, 151, 0.34), transparent 38%), linear-gradient(135deg, #241925 0%, #3a2639 52%, #263349 100%)',
  },
  {
    match: ['night', 'nacht', 'dream', 'traum', 'ambient'],
    light: 'radial-gradient(circle at 20% 18%, rgba(153, 157, 222, 0.5), transparent 36%), radial-gradient(circle at 78% 28%, rgba(231, 153, 188, 0.42), transparent 38%), linear-gradient(135deg, #e6d9ee 0%, #c9d3ed 48%, #f1d4df 100%)',
    dark: 'radial-gradient(circle at 20% 18%, rgba(89, 74, 154, 0.42), transparent 36%), radial-gradient(circle at 78% 28%, rgba(199, 99, 151, 0.3), transparent 38%), linear-gradient(135deg, #171629 0%, #282047 50%, #3b2037 100%)',
  },
  {
    match: ['wow', 'powerpuffpeons', 'gaming', 'mystic', 'azeroth'],
    light: 'radial-gradient(circle at 24% 20%, rgba(139, 169, 134, 0.5), transparent 34%), radial-gradient(circle at 78% 26%, rgba(156, 126, 199, 0.46), transparent 38%), linear-gradient(135deg, #d9dcc3 0%, #c8bfdc 50%, #b9cad8 100%)',
    dark: 'radial-gradient(circle at 24% 20%, rgba(69, 116, 83, 0.34), transparent 36%), radial-gradient(circle at 78% 26%, rgba(120, 86, 160, 0.38), transparent 38%), linear-gradient(135deg, #18261f 0%, #2d2344 48%, #1f3444 100%)',
  },
  {
    match: ['tech', 'technik', 'setup', 'code', 'hardware'],
    light: 'radial-gradient(circle at 20% 20%, rgba(133, 190, 210, 0.5), transparent 34%), radial-gradient(circle at 82% 24%, rgba(153, 163, 185, 0.44), transparent 36%), linear-gradient(135deg, #d3e6ea 0%, #cbd4df 48%, #e1d5e3 100%)',
    dark: 'radial-gradient(circle at 20% 20%, rgba(62, 130, 153, 0.34), transparent 34%), radial-gradient(circle at 82% 24%, rgba(91, 101, 130, 0.38), transparent 36%), linear-gradient(135deg, #142331 0%, #263248 50%, #30283c 100%)',
  },
  {
    match: ['cat', 'cats', 'katze', 'katzen'],
    light: 'radial-gradient(circle at 22% 18%, rgba(255, 203, 160, 0.52), transparent 34%), radial-gradient(circle at 80% 28%, rgba(212, 141, 153, 0.4), transparent 38%), linear-gradient(135deg, #f1ddc7 0%, #e6c8cd 50%, #d8c5d8 100%)',
    dark: 'radial-gradient(circle at 22% 18%, rgba(166, 96, 66, 0.3), transparent 34%), radial-gradient(circle at 80% 28%, rgba(155, 82, 108, 0.34), transparent 38%), linear-gradient(135deg, #2b211f 0%, #3a2633 52%, #2b2d43 100%)',
  },
];

const fallbackPalettes = [
  ['#f2d7bf', '#d6c2dc', '#b8cfe4', '#251a2d', '#3a263c', '#213449'],
  ['#d7e2ca', '#c7c4df', '#e9cbd4', '#17261f', '#2d2747', '#3a2035'],
  ['#d5e4ea', '#d9cce1', '#f1d3c7', '#142532', '#2d2a43', '#3a2434'],
];

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function findPalette(text: string) {
  return palettes.find((palette) => palette.match.some((term) => text.includes(term)));
}

function fallbackGradient(seed: number, dark = false) {
  const colors = fallbackPalettes[seed % fallbackPalettes.length];
  const offset = dark ? 3 : 0;
  return `radial-gradient(circle at ${18 + (seed % 9)}% ${16 + (seed % 7)}%, ${colors[offset]}cc, transparent 35%), radial-gradient(circle at ${74 + (seed % 11)}% ${24 + (seed % 8)}%, ${colors[offset + 1]}b8, transparent 38%), linear-gradient(135deg, ${colors[offset]} 0%, ${colors[offset + 1]} 50%, ${colors[offset + 2]} 100%)`;
}

export function getCardGradientStyle(input: GradientInput) {
  const source = [
    input.collection,
    ...(input.tags ?? []),
    input.title,
    input.artist,
    input.track,
  ].filter(Boolean).join(' ').toLowerCase();
  const seed = hashText(source);
  const palette = findPalette(source);
  const light = palette?.light ?? fallbackGradient(seed, false);
  const dark = palette?.dark ?? fallbackGradient(seed, true);

  return `--card-gradient-light: ${light}; --card-gradient-dark: ${dark};`;
}
