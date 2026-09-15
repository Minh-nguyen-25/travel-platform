/** Match a landmark across common typography changes without folding distinct names. */
export function canonicalDestinationName(name: string): string {
  return name.normalize('NFC')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}
