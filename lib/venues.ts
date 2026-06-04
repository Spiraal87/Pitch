// Hardcoded 2026 World Cup venue assignments
// Key: sorted team IDs joined by '|' (order-independent)
// Source: FIFA 2026 official schedule

interface Venue {
  name: string;
  city: string;
  country: string;
}

const VENUES: Record<string, Venue> = {
  // ── Group A: Mexico, South Korea, South Africa, Czechia ──────────────
  'mexico|south-korea':           { name: 'Estadio Azteca',         city: 'Mexico City', country: 'Mexico' },
  'czechia|south-africa':         { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'mexico|czechia':               { name: 'Estadio Akron',          city: 'Guadalajara', country: 'Mexico' },
  'south-africa|south-korea':     { name: 'SoFi Stadium',           city: 'Los Angeles', country: 'USA' },
  'mexico|south-africa':          { name: 'Estadio BBVA',           city: 'Monterrey',   country: 'Mexico' },
  'czechia|south-korea':          { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },

  // ── Group B: Canada, Switzerland, Qatar, Bosnia-Herzegovina ──────────
  'canada|switzerland':           { name: 'BMO Field',              city: 'Toronto',     country: 'Canada' },
  'bosnia-herzegovina|qatar':     { name: 'BC Place',               city: 'Vancouver',   country: 'Canada' },
  'canada|qatar':                 { name: 'BMO Field',              city: 'Toronto',     country: 'Canada' },
  'bosnia-herzegovina|switzerland':{ name: 'Lumen Field',           city: 'Seattle',     country: 'USA' },
  'canada|bosnia-herzegovina':    { name: 'BC Place',               city: 'Vancouver',   country: 'Canada' },
  'qatar|switzerland':            { name: 'Lumen Field',            city: 'Seattle',     country: 'USA' },

  // ── Group C: Brazil, Morocco, Haiti, Scotland ────────────────────────
  'brazil|morocco':               { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'haiti|scotland':               { name: 'SoFi Stadium',           city: 'Los Angeles', country: 'USA' },
  'brazil|scotland':              { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },
  'haiti|morocco':                { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'brazil|haiti':                 { name: 'SoFi Stadium',           city: 'Los Angeles', country: 'USA' },
  'morocco|scotland':             { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },

  // ── Group D: USA, Paraguay, Australia, Türkiye ───────────────────────
  'paraguay|usa':                 { name: 'SoFi Stadium',           city: 'Los Angeles',   country: 'USA' },
  'australia|trkiye':             { name: 'MetLife Stadium',         city: 'New York',      country: 'USA' },
  'turkey|usa':                   { name: 'Arrowhead Stadium',       city: 'Kansas City',   country: 'USA' },
  'australia|paraguay':           { name: 'NRG Stadium',             city: 'Houston',       country: 'USA' },
  'trkiye|usa':                   { name: 'Arrowhead Stadium',       city: 'Kansas City',   country: 'USA' },
  'paraguay|trkiye':              { name: 'NRG Stadium',             city: 'Houston',       country: 'USA' },
  'australia|usa':                { name: 'Levi\'s Stadium',         city: 'San Francisco', country: 'USA' },

  // ── Group E: Germany, Curaçao, Ivory Coast, Ecuador ─────────────────
  'curacao|germany':              { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
  'ecuador|ivory-coast':          { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'curacao|ecuador':              { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },
  'germany|ivory-coast':          { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
  'curacao|ivory-coast':          { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'ecuador|germany':              { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },

  // ── Group F: Netherlands, Japan, Sweden, Tunisia ─────────────────────
  'japan|netherlands':            { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'sweden|tunisia':               { name: 'Lumen Field',            city: 'Seattle',     country: 'USA' },
  'netherlands|sweden':           { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },
  'japan|tunisia':                { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'netherlands|tunisia':          { name: 'Lumen Field',            city: 'Seattle',     country: 'USA' },
  'japan|sweden':                 { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },

  // ── Group G: Belgium, Egypt, Iran, New Zealand ───────────────────────
  'belgium|egypt':                { name: 'Levi\'s Stadium',        city: 'San Francisco', country: 'USA' },
  'iran|new-zealand':             { name: 'Lumen Field',            city: 'Seattle',     country: 'USA' },
  'belgium|iran':                 { name: 'SoFi Stadium',           city: 'Los Angeles', country: 'USA' },
  'egypt|new-zealand':            { name: 'Levi\'s Stadium',        city: 'San Francisco', country: 'USA' },
  'belgium|new-zealand':          { name: 'SoFi Stadium',           city: 'Los Angeles', country: 'USA' },
  'egypt|iran':                   { name: 'Lumen Field',            city: 'Seattle',     country: 'USA' },

  // ── Group H: Spain, Cape Verde, Saudi Arabia, Uruguay ────────────────
  'cape-verde|spain':             { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'saudi-arabia|uruguay':         { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'saudi-arabia|spain':           { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },
  'cape-verde|uruguay':           { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'saudi-arabia|cape-verde':      { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'spain|uruguay':                { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },

  // ── Group I: France, Senegal, Iraq, Norway ───────────────────────────
  'france|senegal':               { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'iraq|norway':                  { name: 'Empower Field',          city: 'Denver',      country: 'USA' },
  'france|iraq':                  { name: 'Arrowhead Stadium',      city: 'Kansas City', country: 'USA' },
  'norway|senegal':               { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'france|norway':                { name: 'Empower Field',          city: 'Denver',      country: 'USA' },
  'iraq|senegal':                 { name: 'Arrowhead Stadium',      city: 'Kansas City', country: 'USA' },

  // ── Group J: Argentina, Algeria, Austria, Jordan ─────────────────────
  'algeria|argentina':            { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },
  'austria|jordan':               { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },
  'argentina|austria':            { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'algeria|jordan':               { name: 'NRG Stadium',            city: 'Houston',     country: 'USA' },
  'argentina|jordan':             { name: 'Hard Rock Stadium',      city: 'Miami',       country: 'USA' },
  'algeria|austria':              { name: 'AT&T Stadium',           city: 'Dallas',      country: 'USA' },

  // ── Group K: Portugal, DR Congo, Uzbekistan, Colombia ────────────────
  'dr-congo|portugal':            { name: 'Arrowhead Stadium',      city: 'Kansas City', country: 'USA' },
  'colombia|uzbekistan':          { name: 'Empower Field',          city: 'Denver',      country: 'USA' },
  'portugal|uzbekistan':          { name: 'Arrowhead Stadium',      city: 'Kansas City', country: 'USA' },
  'colombia|dr-congo':            { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
  'dr-congo|uzbekistan':          { name: 'Empower Field',          city: 'Denver',      country: 'USA' },
  'colombia|portugal':            { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },

  // ── Group L: England, Croatia, Ghana, Panama ─────────────────────────
  'croatia|england':              { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },
  'ghana|panama':                 { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
  'england|ghana':                { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'croatia|panama':               { name: 'Gillette Stadium',       city: 'Boston',      country: 'USA' },
  'england|panama':               { name: 'MetLife Stadium',        city: 'New York',    country: 'USA' },
  'croatia|ghana':                { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA' },
};

export function getMatchVenue(homeTeamId: string, awayTeamId: string): Venue | null {
  const key = [homeTeamId, awayTeamId].sort().join('|');
  return VENUES[key] ?? null;
}
