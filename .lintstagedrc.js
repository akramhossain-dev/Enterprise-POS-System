module.exports = {
  'apps/api/**/*.ts': (filenames) => {
    const relativePaths = filenames.map((f) => {
      const index = f.indexOf('apps/api/');
      return index !== -1 ? f.substring(index + 'apps/api/'.length) : f;
    });
    return `pnpm --filter @enterprise-pos/api exec eslint --fix ${relativePaths.join(' ')}`;
  },
  '**/*.{ts,tsx,js,jsx,json,md,yaml,yml}': ['prettier --write'],
};
