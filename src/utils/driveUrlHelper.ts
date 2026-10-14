/**
 * Converts public Google Drive file links to directly embeddable image URLs.
 * Leaves standard web URLs unchanged.
 */
export function formatDisplayImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Check for Google Drive links
  if (trimmed.includes('drive.google.com')) {
    // 1. https://drive.google.com/file/d/FILE_ID/...
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }

    // 2. https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID
    const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryIdMatch && queryIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${queryIdMatch[1]}`;
    }
  }

  return trimmed;
}

export function isGoogleDriveUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com');
}
