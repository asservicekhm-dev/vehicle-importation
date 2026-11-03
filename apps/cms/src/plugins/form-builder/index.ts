import type { Config } from 'payload';

import { Forms } from './collections/Forms';
import { FormSubmissions } from './collections/FormSubmissions';

export const formBuilder =
  () =>
  (config: Config): Config => ({
    ...config,
    collections: [...(config.collections ?? []), Forms, FormSubmissions],
  });
