import path from 'path';
import { buildConfig, type SharpDependency } from 'payload';
import { en } from 'payload/i18n/en';
import { uk } from 'payload/i18n/uk';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';

import { defaultLocale, localeLabels, locales } from '@autosearch/config';

import { Blog } from './collections/Blog';
import { BlogAuthors } from './collections/BlogAuthors';
import { BlogCategories } from './collections/BlogCategories';
import { BotUsers } from './collections/BotUsers';
import { Leads } from './collections/Leads';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Users } from './collections/Users';
import { Contacts } from './globals/Contacts';
import { Footer } from './globals/Footer';
import { Header } from './globals/Header';
import { PriceList } from './globals/PriceList';
import { SiteSettings } from './globals/SiteSettings';
import { ensureS3Bucket } from './lib/ensureS3Bucket';
import { hasS3Config, requireEnv } from './lib/env';
import { buildLivePreviewUrl } from './lib/livePreview';
import { plugins } from './plugins';
import { getServerOrigin } from './utilities/getURL';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const s3Configured = hasS3Config();

export default buildConfig({
  admin: {
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: process.env.AUTOLOGIN_EMAIL ?? 'dev@payloadcms.com',
            password: process.env.AUTOLOGIN_PASSWORD ?? 'test',
          }
        : false,
    dateFormat: 'dd/MM/yyyy HH:mm',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        { height: 844, label: 'Mobile', name: 'mobile', width: 390 },
        { height: 900, label: 'Desktop', name: 'desktop', width: 1440 },
      ],
      collections: ['pages', 'blog'],
      globals: ['header', 'footer', 'contacts', 'site-settings', 'price-list'],
      url: buildLivePreviewUrl,
    },
    user: Users.slug,
  },
  collections: [Users, Media, Pages, Leads, BotUsers, Blog, BlogCategories, BlogAuthors],
  db: mongooseAdapter({
    url: requireEnv('DATABASE_URI'),
  }),
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      BoldFeature(),
      LinkFeature(),
      BlockquoteFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      FixedToolbarFeature(),
    ],
  }),
  globals: [Header, Footer, Contacts, SiteSettings, PriceList],
  async onInit(payload) {
    if (s3Configured) {
      await ensureS3Bucket(payload);
    }

    if (process.env.NODE_ENV !== 'production') {
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1,
      });

      if (existingUsers.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: process.env.AUTOLOGIN_EMAIL ?? 'dev@payloadcms.com',
            password: process.env.AUTOLOGIN_PASSWORD ?? 'test',
            role: 'admin',
            name: 'Dev Admin',
          },
        });
      }
    }
  },
  plugins: [
    s3Storage({
      // MinIO rejects ACL headers after the first object when a bucket policy is set.
      // Public reads come from the bucket policy in ensureS3Bucket.
      acl:
        process.env.S3_ENDPOINT || process.env.S3_ACL !== 'public-read'
          ? undefined
          : 'public-read',
      bucket: process.env.S3_BUCKET ?? '',
      collections: {
        media: s3Configured
          ? {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename: fileName, prefix }) => {
                const key = prefix ? `${prefix}/${fileName}` : fileName;
                return `/api/media-redirect?k=${encodeURIComponent(key)}`;
              },
            }
          : true,
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
        ...(process.env.S3_ENDPOINT
          ? {
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
            }
          : {}),
        region: process.env.S3_REGION || 'us-east-1',
        // AWS SDK v3 sends flexible checksums by default. MinIO accepts the
        // first PutObject on a connection and then drops the rest, so only
        // the first file of each seed process lands in the bucket.
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      },
      enabled: s3Configured,
    }),
    ...plugins,
  ],
  i18n: {
    fallbackLanguage: 'uk',
    supportedLanguages: { en, uk },
  },
  localization: {
    defaultLocale,
    fallback: false,
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
  },
  secret: requireEnv('PAYLOAD_SECRET'),
  serverURL: getServerOrigin(),
  sharp: sharp as unknown as SharpDependency,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
