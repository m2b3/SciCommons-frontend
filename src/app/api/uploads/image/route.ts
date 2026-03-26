import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
];

const FILE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const normalizeImageMimeType = (mimeType: string) => {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (normalizedMimeType === 'image/jpg') return 'image/jpeg';
  return normalizedMimeType;
};

const resolveBackendUploadUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || process.env.BACKEND_URL?.trim();
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, '')}/api/uploads/image`;
};

const buildUploadFileName = (file: File, normalizedMimeType: string) => {
  const fallbackExtension = FILE_EXTENSION_BY_MIME_TYPE[normalizedMimeType] ?? 'bin';
  const trimmedName = file.name.trim();

  if (!trimmedName) {
    return `clipboard-image-${Date.now()}.${fallbackExtension}`;
  }

  if (/\.[A-Za-z0-9]+$/.test(trimmedName)) {
    return trimmedName;
  }

  return `${trimmedName}.${fallbackExtension}`;
};

const readUpstreamErrorMessage = async (upstreamResponse: Response) => {
  const contentType = upstreamResponse.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = (await upstreamResponse.json().catch(() => null)) as {
      error?: string;
      detail?: string;
      message?: string;
    } | null;
    return payload?.error ?? payload?.detail ?? payload?.message ?? null;
  }

  const message = await upstreamResponse.text().catch(() => '');
  return message.trim() || null;
};

const normalizeOriginHeader = (originHeader: string | null) => {
  if (!originHeader) return null;

  const trimmedOriginHeader = originHeader.trim();
  if (!trimmedOriginHeader) return null;

  try {
    return new URL(trimmedOriginHeader).origin;
  } catch {
    return null;
  }
};

const normalizeRefererHeader = (refererHeader: string | null) => {
  if (!refererHeader) return null;

  const trimmedRefererHeader = refererHeader.trim();
  if (!trimmedRefererHeader) return null;

  try {
    return new URL(trimmedRefererHeader).toString();
  } catch {
    return null;
  }
};

type ForwardedOriginHeaders = {
  originHeader: string | null;
  refererHeader: string | null;
};

type UpstreamUploadResponse = {
  response: Response;
  message: string | null;
};

/* Fixed by Codex on 2026-02-28
   Who: Codex
   What: Centralized forwarding of frontend-origin context for upload proxy requests.
   Why: Backend upload API performs its own Origin/Referer allowlist validation, so proxy calls must preserve caller origin context.
   How: Prefer browser-provided Origin/Referer, then fall back to request URL origin for server-side continuity. */
const buildForwardedOriginHeaders = (request: NextRequest): ForwardedOriginHeaders => {
  const browserOrigin = normalizeOriginHeader(request.headers.get('origin'));
  const browserReferer = normalizeRefererHeader(request.headers.get('referer'));
  const requestOrigin = normalizeOriginHeader(request.nextUrl.origin);
  const resolvedOrigin = browserOrigin ?? requestOrigin;

  return {
    originHeader: resolvedOrigin,
    refererHeader: browserReferer ?? (resolvedOrigin ? `${resolvedOrigin}/` : null),
  };
};

const uploadToBackend = async (
  backendUploadUrl: string,
  authorizationHeader: string,
  upstreamFormData: FormData,
  forwardedOriginHeaders: ForwardedOriginHeaders
): Promise<UpstreamUploadResponse> => {
  const headers = new Headers();
  headers.set('Authorization', authorizationHeader);

  if (forwardedOriginHeaders.originHeader) {
    headers.set('Origin', forwardedOriginHeaders.originHeader);
  }

  if (forwardedOriginHeaders.refererHeader) {
    headers.set('Referer', forwardedOriginHeaders.refererHeader);
  }

  const response = await fetch(backendUploadUrl, {
    method: 'POST',
    headers,
    body: upstreamFormData,
    cache: 'no-store',
  });

  if (response.ok) {
    return { response, message: null };
  }

  const message = await readUpstreamErrorMessage(response);
  return { response, message };
};

/* Fixed by Codex on 2026-02-28
   Who: Codex
   What: Added a same-origin Next.js proxy route for markdown image uploads.
   Why: Browser-direct uploads could hit backend origin checks, and pasted JPG payloads needed MIME/file-name normalization.
   How: Validate auth and file payload, normalize MIME + filename, forward multipart upload to backend, and relay backend error details. */
export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUploadUrl = resolveBackendUploadUrl();
    if (!backendUploadUrl) {
      return NextResponse.json({ error: 'Backend upload URL is not configured' }, { status: 500 });
    }

    const incomingFormData = await request.formData();
    const incomingFile = incomingFormData.get('file');

    if (!(incomingFile instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const normalizedMimeType = normalizeImageMimeType(incomingFile.type);
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(normalizedMimeType)) {
      return NextResponse.json(
        { error: `Invalid image type. Allowed: ${ALLOWED_UPLOAD_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const uploadFileName = buildUploadFileName(incomingFile, normalizedMimeType);
    const normalizedFile =
      normalizedMimeType === incomingFile.type && uploadFileName === incomingFile.name
        ? incomingFile
        : new File([await incomingFile.arrayBuffer()], uploadFileName, {
            type: normalizedMimeType,
          });

    const upstreamFormData = new FormData();
    upstreamFormData.append('file', normalizedFile);

    const forwardedOriginHeaders = buildForwardedOriginHeaders(request);
    const upstreamUpload = await uploadToBackend(
      backendUploadUrl,
      authorizationHeader,
      upstreamFormData,
      forwardedOriginHeaders
    );

    if (!upstreamUpload.response.ok) {
      return NextResponse.json(
        {
          error:
            upstreamUpload.message ?? `Upload failed with status ${upstreamUpload.response.status}`,
        },
        { status: upstreamUpload.response.status }
      );
    }

    const uploadPayload = (await upstreamUpload.response.json().catch(() => null)) as {
      public_url?: string;
    } | null;
    if (!uploadPayload?.public_url) {
      return NextResponse.json(
        { error: 'Upload succeeded but no image URL was returned' },
        { status: 502 }
      );
    }

    return NextResponse.json(uploadPayload);
  } catch (error) {
    console.error('Image upload proxy error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
