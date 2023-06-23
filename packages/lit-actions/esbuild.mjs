import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import * as esbuild from 'esbuild'

/** Mapping from module paths to global variables */
const globals = {
  ethers: {
    varName: 'ethers',
    namedExports: ["ethers"],
    defaultExport: true
  },
  crypto: {
    varName: 'crypto',
    // namedExports: ["ethers"],
    defaultExport: true
  }
}

esbuild.build({
  entryPoints: ['src/multisig.action.ts'],
  outdir: 'dist',
  bundle: true,
  // platform: "node",
  plugins: [globalExternals(globals)]
})
