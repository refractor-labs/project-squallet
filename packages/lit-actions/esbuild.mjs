import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import * as esbuild from 'esbuild'
import fs from "fs";

/** Mapping from module paths to global variables */
const globals = {
  ethers: {
    varName: 'ethers',
    // require a named import ie `import { ethers } from 'ethers'`
    namedExports: ["ethers"],
    defaultExport: false//disallow default export because it breaks node tests
  },
  crypto: {
    varName: 'crypto',
    // namedExports: ["ethers"],
    defaultExport: true
  }
}

const infile = 'multisig.action.ts'
const outfile = 'multisig.action.js'

const inDir = 'src'
const outDir = 'dist'

async  function build() {


  await esbuild.build({
    entryPoints: [`${inDir}/${infile}`],
    outdir: outDir,
    bundle: true,
    // platform: "node",
    plugins: [globalExternals(globals)]
  })

  const getLitActionCode = (file) => {
    const outFilePath = file

    let code

    try {
      code = fs.readFileSync(outFilePath)
      let codeString = code.toString()
      codeString = codeString.replace(
        `// global-externals:ethers
  var { ethers } = ethers;`,
        `// global-externals:ethers pizza
  var ethers = ethers;`
      )
      fs.writeFileSync(outFilePath, codeString)
    } catch (e) {
      console.error(
        '\n\x1b[31m%s\x1b[0m',
        `❌ ${outFilePath} not found\n\n   Please run "getlit build" first\n`
      )
    }
  }
  getLitActionCode(`${outDir}/${outfile}`)
}
build()