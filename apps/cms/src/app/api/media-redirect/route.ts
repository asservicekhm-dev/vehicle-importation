import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function normalizeEndpoint(candidate: string | undefined): string | undefined {
  const t = candidate?.trim();
  if (!t) return undefined;
  return t.replace(/\/$/, '');
}

function extractOrigin(publicUrlRaw: string): string | undefined {
  const trimmed = publicUrlRaw.trim();
  if (!trimmed) return undefined;
  try {
    return new URL(trimmed).origin;
  } catch {
    return undefined;
  }
}

function presignEndpointOrigin(): string | undefined {
  return (
    normalizeEndpoint(process.env.S3_PRESIGN_ENDPOINT) ??
    extractOrigin(process.env.S3_PUBLIC_URL ?? '') ??
    normalizeEndpoint(process.env.S3_ENDPOINT)
  );
}

function sanitizeKey(raw: string): string | null {
  const decoded = decodeURIComponent(raw).trim();
  if (!decoded || decoded.includes('..') || decoded.startsWith('/') || decoded.includes('\\')) {
    return null;
  }
  return decoded;
}

function mediaDirs(): string[] {
  const fromEnv = process.env.MEDIA_PATH?.trim();
  const cwd = process.cwd();
  return [fromEnv, path.resolve(cwd, 'media'), path.resolve(cwd, 'apps/cms/media')].filter(
    (p): p is string => Boolean(p),
  );
}

function tryLocalFileResponse(key: string): NextResponse | null {
  const filename = path.basename(key);
  for (const dir of mediaDirs()) {
    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) continue;

    const data = fs.readFileSync(fullPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(data.byteLength),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const k = request.nextUrl.searchParams.get('k');
  if (!k) {
    return new NextResponse('Missing object key.', { status: 400 });
  }

  const key = sanitizeKey(k);
  if (!key) {
    return new NextResponse('Invalid object key.', { status: 400 });
  }

  const local = tryLocalFileResponse(key);
  if (local) return local;

  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) {
    return new NextResponse('Object storage is not configured.', { status: 503 });
  }

  const endpoint = presignEndpointOrigin();
  if (!endpoint) {
    return new NextResponse(
      'Storage signing host is not configured (set S3_PUBLIC_URL, S3_PRESIGN_ENDPOINT, or S3_ENDPOINT).',
      { status: 503 },
    );
  }

  const expiresInRaw = process.env.S3_PRESIGN_EXPIRES_SECONDS?.trim();
  const expiresIn = Math.min(
    604800,
    Math.max(60, expiresInRaw ? Number.parseInt(expiresInRaw, 10) || 3600 : 3600),
  );

  const client = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    region: process.env.S3_REGION || 'us-east-1',
  });

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const signedUrl = await getSignedUrl(client, command, { expiresIn });
    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error('[media-redirect] presign failed', err);
    return new NextResponse('Object not found.', { status: 404 });
  }
}
