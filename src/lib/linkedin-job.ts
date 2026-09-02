export type ParsedJob = {
  company: string | null;
  role: string | null;
  location: string | null;
};

// LinkedIn blocks requests that don't look like a real browser.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

type JobPostingAddress = {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string | { name?: string };
};

type JobPostingSchema = {
  "@type"?: string;
  title?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: JobPostingAddress };
};

function extractJsonLdBlocks(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // malformed JSON-LD block on the page — skip it
    }
  }
  return blocks;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Matches the meta tag by its `property` or `name` attribute regardless of
// attribute order within the tag.
function extractMetaContent(html: string, key: string): string | null {
  const tagRe = new RegExp(`<meta[^>]*(?:property|name)=["']${key}["'][^>]*>`, "i");
  const tag = html.match(tagRe)?.[0];
  if (!tag) return null;
  const contentMatch = tag.match(/content=["']([^"']*)["']/i);
  return contentMatch ? decodeHtmlEntities(contentMatch[1]) : null;
}

function formatAddress(address: JobPostingAddress | undefined): string | null {
  if (!address) return null;
  const country =
    typeof address.addressCountry === "string"
      ? address.addressCountry
      : address.addressCountry?.name;
  return (
    [address.addressLocality, address.addressRegion || country].filter(Boolean).join(", ") ||
    null
  );
}

function fromJsonLd(html: string): ParsedJob | null {
  const jobPosting = extractJsonLdBlocks(html).find(
    (block) => block["@type"] === "JobPosting",
  ) as JobPostingSchema | undefined;
  if (!jobPosting) return null;

  return {
    role: jobPosting.title ?? null,
    company: jobPosting.hiringOrganization?.name ?? null,
    location: formatAddress(jobPosting.jobLocation?.address),
  };
}

// LinkedIn's public (logged-out) job page renders a stable "top card" block
// with dedicated classes for title/company/location — unlike the meta tags
// below, this doesn't vary with how the poster wrote the description.
function fromTopCard(html: string): ParsedJob | null {
  const roleMatch = html.match(/<h1[^>]*class="[^"]*topcard__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  const companyMatch = html.match(
    /<a[^>]*class="[^"]*topcard__org-name-link[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
  );
  const locationMatch = html.match(
    /<span class="topcard__flavor topcard__flavor--bullet"[^>]*>([\s\S]*?)<\/span>/i,
  );

  const role = roleMatch ? decodeHtmlEntities(roleMatch[1]).trim() : null;
  const company = companyMatch ? decodeHtmlEntities(companyMatch[1]).trim() : null;
  if (!role && !company) return null;

  return {
    role,
    company,
    location: locationMatch ? decodeHtmlEntities(locationMatch[1]).trim() : null,
  };
}

// LinkedIn's meta description follows a fixed template:
// "Apply for <Role> at <Company> in <Location>. <employment type> ..."
function fromMetaDescription(html: string): ParsedJob | null {
  const description = extractMetaContent(html, "description");
  const match = description?.match(/^Apply for (.+?)\s+at\s+(.+?)\s+in\s+(.+?)\.\s/i);
  if (!match) return null;

  return { role: match[1], company: match[2], location: match[3] };
}

// Older/alternate template: "<Role> at <Company> — <Location> | LinkedIn Jobs".
function fromOgTitle(html: string): ParsedJob | null {
  const ogTitle = extractMetaContent(html, "og:title");
  const match = ogTitle?.match(
    /^(.*?)\s+at\s+(.*?)(?:\s+[—–-]\s+(.*?))?\s*\|\s*LinkedIn(?:\s+Jobs)?\s*$/i,
  );
  if (!match) return null;

  return { role: match[1], company: match[2], location: match[3] ?? null };
}

export async function fetchLinkedInJob(url: string): Promise<ParsedJob> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`LinkedIn returned ${res.status}`);
  }

  const html = await res.text();

  return (
    fromJsonLd(html) ??
    fromTopCard(html) ??
    fromMetaDescription(html) ??
    fromOgTitle(html) ?? { role: null, company: null, location: null }
  );
}
