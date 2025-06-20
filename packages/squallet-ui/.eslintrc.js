module.exports = {
    root: true,
    extends: ['custom', 'next/core-web-vitals'],
    ignorePatterns: ['src/prisma/*'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    },
};
