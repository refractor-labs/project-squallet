// @ts-check
// const withTM = require('next-transpile-modules')([
//     '@refractor-labs/shared-utils',
//     '@refractor-labs/core-lib',
//     '@refractor-labs/db-client-prisma',
//     '@refractor-labs/api-client',
// ]); // pass the modules you would like to see transpiled

/**
 * @type {import('next').NextConfig}
 **/
const moduleExports = {
    experimental: {
        esmExternals: false,
    },
    async redirects() {
        return [
            {
                source: '/verify',
                destination: '/settings',
                permanent: true,
            },
            {
                source: '/access',
                destination: '/rewards',
                permanent: true,
            },
        ];
    },
    reactStrictMode: true,
    // swcMinify: true,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    // future: {
    //     webpack5: true,
    // },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };

        return config;
    },
    transpilePackages: [
        '@refractor-labs/shared-utils',
        '@refractor-labs/core-lib',
        '@refractor-labs/db-client-prisma',
        '@refractor-labs/api-client',
    ],
    images: {
        domains: [
            'lh3.googleusercontent.com',
            'gnosis-safe-token-logos.s3.amazonaws.com',
            'cloudflare-ipfs.com',
            'storage.opensea.io',
            'ipfs.io',
            'nccmlpufieusnuqflhrr.supabase.co',
            'nccmlpufieusnuqflhrr.supabase.in',
            'e6iqqahgk7gaqisbgijoqeouteapupobyltpnydezoufke3k6aoq.arweave.net',
            'storage.googleapis.com',
            'openseauserdata.com',
            's3.amazonaws.com',
            'token-icons.s3.amazonaws.com',
            'img.seadn.io',
            'token-icons.s3.us-east-1.amazonaws.com',
            'img-ae.seadn.io',
            'dkpass-assets.s3.us-west-1.amazonaws.com',
            'thestoics.s3.us-east-2.amazonaws.com',
            'i.seadn.io',
            'assets.coingecko.com',
            'raw.githubusercontent.com',
            's2.coinmarketcap.com',
            'cdn.discordapp.com',
            'lore.xyz',
            'memberpass.lore.xyz',
        ],
        formats: ['image/avif', 'image/webp'],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // compiler: {
    //   removeConsole: true,
    // },
    sentry: {
        hideSourceMaps: true,
    },
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = moduleExports;
