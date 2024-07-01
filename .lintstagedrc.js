module.exports = {
  '*/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
    'eslint',
    () => 'tsc --skipLibCheck --noEmit',
  ],
  '*/**/*.{json,css,md}': ['prettier --write'],
};
