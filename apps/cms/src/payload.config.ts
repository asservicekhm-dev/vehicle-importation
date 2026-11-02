import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import { mongooseAdapter } from '@payloadcms/db-mongodb';

import { defaultLocale, localeLabels, locales } from '@autosearch/config';

import { Users } from './collections/Users';
import { requireEnv } from './lib/env';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Users],
  db: mongooseAdapter({
    url: requireEnv('DATABASE_URI'),
  }),
  localization: {
    defaultLocale,
    fallback: false,
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
  },
  secret: requireEnv('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
