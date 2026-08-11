import { isSupportedImage } from './image-upload';

test('accepts matching raster signatures and rejects disguised markup', () => {
  const markup = Uint8Array.from([0x3c, 0x73, 0x76, 0x67, 0x3e]);
  expect(isSupportedImage(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg')).toBe(true);
  expect(isSupportedImage(markup, 'image/png')).toBe(false);
  expect(isSupportedImage(markup, 'image/svg+xml')).toBe(false);
  expect(isSupportedImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]), 'image/png')).toBe(false);
});
