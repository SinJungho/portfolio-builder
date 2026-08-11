const SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/png': (b) => b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => b[index] === byte),
  'image/jpeg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/gif': (b) => b.length >= 6 && ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...b.slice(0, 6))),
  'image/webp': (b) => b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
};

export const IMAGE_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export function isSupportedImage(bytes: Uint8Array, contentType: string): boolean {
  return SIGNATURES[contentType]?.(bytes) ?? false;
}
