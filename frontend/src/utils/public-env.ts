/** Vite embeds VITE_* values in public JavaScript; reject obvious credential leaks at build time. */
export function assertNoFrontendSecrets(env: Record<string, string | undefined>): void {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith('VITE_') || !value) continue;
    if (/(SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE_KEY)/i.test(name)) {
      throw new Error(`${name} cannot be exposed through the frontend build`);
    }
    if (name.endsWith('_URL')) {
      const url = new URL(value, 'http://frontend.local');
      if (url.username || url.password || url.search || url.hash) {
        throw new Error(`${name} must not contain credentials, query parameters or fragments`);
      }
    }
  }
}
