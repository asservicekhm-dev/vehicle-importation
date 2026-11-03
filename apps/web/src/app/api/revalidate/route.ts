import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Body = {
  paths?: string[];
  tags?: string[];
};

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  const headerSecret = request.headers.get('x-revalidate-secret');

  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string') : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : [];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
    revalidatePath(`/en${path === '/' ? '' : path}`);
  }

  return NextResponse.json({ ok: true, revalidated: { tags, paths } });
}
