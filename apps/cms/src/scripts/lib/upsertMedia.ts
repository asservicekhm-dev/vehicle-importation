import fs from 'fs/promises';
import path from 'path';
import type { Payload } from 'payload';

const skip = { skipRevalidate: true } as const;

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

  return created.id;
}
