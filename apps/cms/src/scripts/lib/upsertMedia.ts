import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import type { Payload } from 'payload';

const skip = { skipRevalidate: true } as const;

let storageClient: { bucket: string; client: S3Client } | null | undefined;

function storage(): { bucket: string; client: S3Client } | null {
  if (storageClient !== undefined) return storageClient;

  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) {
    storageClient = null;
    return storageClient;
  }

  storageClient = {
    bucket,
    client: new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      ...(process.env.S3_ENDPOINT
        ? {
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
          }
        : {}),
      region: process.env.S3_REGION || 'us-east-1',
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }),
  };
  return storageClient;
}

/** Payload's S3 adapter reports success while MinIO keeps only the first object. Write the original directly. */
async function putOriginal(filename: string, body: Buffer, mimeType: string): Promise<void> {
  const store = storage();
  if (!store) return;

  await store.client.send(
    new PutObjectCommand({
      Bucket: store.bucket,
      Key: filename,
      Body: body,
      ContentType: mimeType,
    }),
  );

  try {
    await store.client.send(new HeadObjectCommand({ Bucket: store.bucket, Key: filename }));
  } catch (err) {
    throw new Error(`Seed upload did not persist "${filename}" in bucket "${store.bucket}".`, {
      cause: err,
    });
  }
}

export async function upsertMediaByFilename(
  payload: Payload,
  args: {
    filePath: string;
    filename: string;
    altUa: string;
    altEn: string;
  },
): Promise<string> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: args.filename } },
    limit: 1,
    depth: 0,
  });

  const buffer = await fs.readFile(args.filePath);
  const ext = path.extname(args.filename).toLowerCase();
  const mimeType =
    ext === '.webp'
      ? 'image/webp'
      : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream';

  const file = {
    data: buffer,
    mimetype: mimeType,
    name: args.filename,
    size: buffer.byteLength,
  };

  if (existing.docs[0]?.id) {
    const doc = await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      locale: 'ua',
      data: { alt: args.altUa },
      file,
      context: skip,
      overwriteExistingFiles: true,
    });

    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: args.altEn },
      context: skip,
    });

    await putOriginal(args.filename, buffer, mimeType);
    return doc.id;
  }

  const created = await payload.create({
    collection: 'media',
    locale: 'ua',
    data: { alt: args.altUa },
    file,
    context: skip,
  });

  await payload.update({
    collection: 'media',
    id: created.id,
    locale: 'en',
    data: { alt: args.altEn },
    context: skip,
  });

  await putOriginal(args.filename, buffer, mimeType);
  return created.id;
}
