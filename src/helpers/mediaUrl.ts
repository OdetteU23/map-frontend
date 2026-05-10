import { getUploadUrl } from './data/fetchData';

/**
 * Converting whatever backend stored in `image_url` into a URL that the browser can fetch.
 *
 * Why:
 * - The S3 bucket objects are private .
 * - The upload server exposes `/uploads/:filename` and streams from S3 using server credentials.
 *
 * Supported input shapes:
 * - full URL: https://.../prefix/filename.png
 * - object key / prefix: uscopex-users-media/filename.png
 * - filename only: filename.png
 * - upload-server path: /uploads/filename.png
 */
export const toUploadServerImageUrl = (
  rawImageUrl: unknown
): string | undefined => {
  if (typeof rawImageUrl !== 'string') return undefined;

  const value = rawImageUrl.trim();
  if (!value) return undefined;

  // If it's already an absolute URL, extract the filename from the pathname.
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const filename = parts[parts.length - 1];
      return filename ? getUploadUrl(filename) : undefined;
    } catch {
      // fall through to filename extraction
    }

    const parts = value.split('/').filter(Boolean);
    const filename = parts[parts.length - 1];
    return filename ? getUploadUrl(filename) : undefined;
  }

  // Not an absolute URL: treat it as key/prefix/filename, take last segment.
  const parts = value.split('/').filter(Boolean);
  const filename = parts[parts.length - 1];
  return filename ? getUploadUrl(filename) : undefined;
};
