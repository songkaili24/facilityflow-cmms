/**
 * Resolves the deployment's site URL for metadata (metadataBase, sitemap).
 * Falls back when the env var is unset OR an empty/whitespace string, since
 * `new URL("")` throws and Vercel env vars can be present but blank.
 */
export function getSiteUrl(env: string | undefined): string {
  const value = env?.trim();
  if (value) return value;
  return "http://localhost:3000";
}
