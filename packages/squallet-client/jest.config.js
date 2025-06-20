// const tsconfig = require('./tsconfig.test.json');
// const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 1_200_000,
    setupFiles: ['dotenv/config'],
    // globals: {
    //     'ts-jest': {
    //         tsconfig: 'tsconfig.json',
    //     },
    // },
    // moduleNameMapper,
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.ts?$': [
            'ts-jest',
            {
                // ts-jest configuration goes here
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
};
