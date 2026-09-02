import cities from "all-the-cities";

export type PredefinedLocation = {
  name: string;
  lat: number;
  lng: number;
};

// Below this population, matches are mostly obscure hamlets that clutter
// suggestions without adding real job-market coverage.
const POPULATION_THRESHOLD = 15000;

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function formatLocationName(city: (typeof cities)[number]): string {
  if (city.country === "US") return `${city.name}, ${city.adminCode}`;
  return `${city.name}, ${countryNames.of(city.country) ?? city.country}`;
}

// Geographic center of the contiguous US — the same fallback JobMap uses
// when there's no data to center on.
const REMOTE: PredefinedLocation = { name: "Remote", lat: 39.8283, lng: -98.5795 };

function toLocation(c: (typeof cities)[number]): PredefinedLocation {
  return {
    name: formatLocationName(c),
    lat: c.loc.coordinates[1],
    lng: c.loc.coordinates[0],
  };
}

// Built once per server process; sorted by population so, among matches,
// the more likely/larger city wins the limited suggestion slots.
const byPopulation = cities
  .filter((c) => c.population >= POPULATION_THRESHOLD)
  .sort((a, b) => b.population - a.population);

const INDEX: PredefinedLocation[] = byPopulation.map(toLocation);

// Shown before the user types anything — common US cities read as more
// useful defaults here than the globally largest cities.
const US_DEFAULTS: PredefinedLocation[] = byPopulation
  .filter((c) => c.country === "US")
  .map(toLocation);

export function searchLocations(query: string, limit = 8): PredefinedLocation[] {
  const q = query.trim().toLowerCase();

  if (!q) return [REMOTE, ...US_DEFAULTS.slice(0, limit - 1)];

  const results: PredefinedLocation[] = [];
  if (REMOTE.name.toLowerCase().includes(q)) results.push(REMOTE);
  for (const loc of INDEX) {
    if (results.length >= limit) break;
    if (loc.name.toLowerCase().includes(q)) results.push(loc);
  }
  return results;
}
