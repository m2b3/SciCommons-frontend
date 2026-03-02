import { NextRequest, NextResponse } from 'next/server';

import sharp from 'sharp';

export const runtime = 'nodejs';

const MAX_INPUT_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const TARGET_OUTPUT_SIZE_BYTES = 200 * 1024; // 200KB
const MIN_AVIF_QUALITY = 20;
const MAX_AVIF_QUALITY = 80;
const MAX_IMAGE_DIMENSION = 1920;
const FALLBACK_DIMENSIONS = [1600, 1280, 1024, 800, 640];
const ALLOWED_INPUT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
];

const normalizeImageMimeType = (mimeType: string) => {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (normalizedMimeType === 'image/jpg') return 'image/jpeg';
  return normalizedMimeType;
};

const compressToAvif = async (
  sourceBuffer: Buffer,
  quality: number,
  dimension = MAX_IMAGE_DIMENSION
) =>
  sharp(sourceBuffer)
    .resize(dimension, dimension, { fit: 'inside', withoutEnlargement: true })
    .avif({ quality })
    .toBuffer();

const buildImageResponse = (outputBuffer: Buffer) =>
  new NextResponse(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/avif',
      'Content-Length': outputBuffer.length.toString(),
      'Cache-Control': 'no-store',
    },
  });

/* Fixed by Codex on 2026-02-28
   Who: Codex
   What: Added a dedicated route handler to normalize markdown-editor uploads into compressed AVIF payloads.
   Why: Frontend editors need predictable sub-500KB upload payloads before calling the backend image endpoint.
   How: Validate multipart input, run quality binary search at bounded dimensions, then optionally downscale
        further until target-size is met or best-effort compression is reached. */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_INPUT_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_INPUT_SIZE_BYTES / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    const normalizedMimeType = normalizeImageMimeType(file.type);
    if (!ALLOWED_INPUT_MIME_TYPES.includes(normalizedMimeType)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_INPUT_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const resizedAtHighQuality = await compressToAvif(sourceBuffer, MAX_AVIF_QUALITY);

    if (resizedAtHighQuality.length <= TARGET_OUTPUT_SIZE_BYTES) {
      return buildImageResponse(resizedAtHighQuality);
    }

    let low = MIN_AVIF_QUALITY;
    let high = MAX_AVIF_QUALITY;
    let bestResult = resizedAtHighQuality;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = await compressToAvif(sourceBuffer, mid);

      if (candidate.length <= TARGET_OUTPUT_SIZE_BYTES) {
        bestResult = candidate;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (bestResult.length <= TARGET_OUTPUT_SIZE_BYTES) {
      return buildImageResponse(bestResult);
    }

    for (const dimension of FALLBACK_DIMENSIONS) {
      const candidate = await compressToAvif(sourceBuffer, MIN_AVIF_QUALITY, dimension);
      bestResult = candidate;
      if (candidate.length <= TARGET_OUTPUT_SIZE_BYTES) {
        break;
      }
    }

    return buildImageResponse(bestResult);
  } catch (error) {
    console.error('Image compression error:', error);
    return NextResponse.json({ error: 'Failed to compress image' }, { status: 500 });
  }
}
