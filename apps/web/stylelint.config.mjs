/** @type {import('stylelint').Config} */
export default {
  customSyntax: 'postcss-scss',
  rules: {},
  overrides: [
    {
      files: ['**/*.module.scss'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
        'declaration-property-value-disallowed-list': {
          '/.*/': [/var\(--_p-/, /var\(--[\w-]+\s*,/],
        },
      },
    },
  ],
};
