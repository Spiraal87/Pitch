import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WIKIPEDIA_OVERRIDES: Record<string, string> = {
  'Vinicius Jr':         'Vinícius_Júnior',
  'Kylian Mbappé':       'Kylian_Mbappé',
  'Rodri':               'Rodrigo_Hernández_Cascante',
  'Son Heung-min':       'Son_Heung-min',
  'Kevin De Bruyne':     'Kevin_De_Bruyne',
  'Virgil van Dijk':     'Virgil_van_Dijk',
  'Xavi Simons':         'Xavi_Simons',
  'Bruno Fernandes':     'Bruno_Fernandes_(footballer,_born_1994)',
  'Aurélien Tchouaméni': 'Aurélien_Tchouaméni',
  'Achraf Hakimi':       'Achraf_Hakimi',
  'Luka Modrić':         'Luka_Modrić',
  'Darwin Núñez':        'Darwin_Núñez',
  'Federico Valverde':   'Federico_Valverde',
  'Luis Díaz':           'Luis_Díaz_(footballer,_born_1997)',
  'James Rodríguez':     'James_Rodríguez',
  'Julián Álvarez':      'Julián_Álvarez_(footballer)',
  'Enzo Fernández':      'Enzo_Fernández_(Argentine_footballer)',
  'Moisés Caicedo':      'Moisés_Caicedo',
  'Alphonso Davies':     'Alphonso_Davies',
  'Granit Xhaka':        'Granit_Xhaka',
  'Weston McKennie':     'Weston_McKennie',
  'Antonee Robinson':    'Antonee_Robinson',
  'Rafael Leão':         'Rafael_Leão',
  'Santiago Giménez':    'Santiago_Giménez',
  'Takefusa Kubo':       'Takefusa_Kubo',
  'Endrick':             'Endrick_Felipe_Moreira',
  'Matt Turner':         'Matt_Turner_(soccer)',
};

function toWikipediaTitle(name: string): string {
  return WIKIPEDIA_OVERRIDES[name] ?? name.replace(/ /g, '_');
}

const HEADERS = { 'User-Agent': 'PitchApp/1.0 (cdjohnsonzero@gmail.com)' };

async function fetchRestSummary(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchMediaWiki(title: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: '400',
      origin: '*',
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchPlayerImage(name: string): Promise<string | null> {
  const title = toWikipediaTitle(name);

  const fromRest = await fetchRestSummary(title);
  if (fromRest) return fromRest;

  await new Promise((r) => setTimeout(r, 200));
  return fetchMediaWiki(title);
}

async function main() {
  const { data: players, error } = await supabase
    .from('players')
    .select('id, name')
    .eq('is_featured', true);

  if (error || !players) {
    console.error('Failed to fetch players:', error);
    process.exit(1);
  }

  console.log(`Fetching images for ${players.length} players...\n`);

  for (const player of players) {
    const imageUrl = await fetchPlayerImage(player.name);

    if (imageUrl) {
      const { error } = await supabase.from('players').update({ image_url: imageUrl }).eq('id', player.id);
      if (error) {
        console.log(`  ✗ ${player.name} — DB error: ${error.message}`);
      } else {
        console.log(`  ✓ ${player.name} — ${imageUrl.slice(0, 60)}...`);
      }
    } else {
      console.log(`  ✗ ${player.name} — no image found`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('\nDone.');
}

main().catch(console.error);
