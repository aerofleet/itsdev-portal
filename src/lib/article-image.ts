// Article thumbnails use the first image in the published body.
export function extractFirstImage(body?: string): string | null {
 if (!body) return null;
 const match = /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)|<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i.exec(body);
 return match?.[1] || match?.[2] || match?.[3] || null;
}
