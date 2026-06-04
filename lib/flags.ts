// Maps team slug to ISO 3166-1 alpha-2 code (used with flag-icons CSS library)
const ISO_MAP: Record<string, string> = {
  // Group A
  'mexico':               'mx',
  'south-korea':          'kr',
  'south-africa':         'za',
  'czechia':              'cz',
  // Group B
  'canada':               'ca',
  'switzerland':          'ch',
  'qatar':                'qa',
  'bosnia-herzegovina':   'ba',
  // Group C
  'brazil':               'br',
  'morocco':              'ma',
  'haiti':                'ht',
  'scotland':             'gb-sct',
  // Group D
  'usa':                  'us',
  'paraguay':             'py',
  'australia':            'au',
  'trkiye':               'tr',
  // Group E
  'germany':              'de',
  'curacao':              'cw',
  'ivory-coast':          'ci',
  'ecuador':              'ec',
  // Group F
  'netherlands':          'nl',
  'japan':                'jp',
  'sweden':               'se',
  'tunisia':              'tn',
  // Group G
  'belgium':              'be',
  'egypt':                'eg',
  'iran':                 'ir',
  'new-zealand':          'nz',
  // Group H
  'spain':                'es',
  'cape-verde':           'cv',
  'saudi-arabia':         'sa',
  'uruguay':              'uy',
  // Group I
  'france':               'fr',
  'senegal':              'sn',
  'iraq':                 'iq',
  'norway':               'no',
  // Group J
  'argentina':            'ar',
  'algeria':              'dz',
  'austria':              'at',
  'jordan':               'jo',
  // Group K
  'portugal':             'pt',
  'dr-congo':             'cd',
  'uzbekistan':           'uz',
  'colombia':             'co',
  // Group L
  'england':              'gb-eng',
  'croatia':              'hr',
  'ghana':                'gh',
  'panama':               'pa',
};

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getIsoCode(teamId: string): string | null {
  return ISO_MAP[teamId] ?? null;
}

export function getIsoCodeByName(name: string): string | null {
  return ISO_MAP[nameToSlug(name)] ?? null;
}

// Legacy emoji helpers — kept for any callers that still use them
export function getFlag(): string { return ''; }
export function getFlagByName(): string { return ''; }
