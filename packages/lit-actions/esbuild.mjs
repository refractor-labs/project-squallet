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
        `// global-externals:ethers
  var ethers = ethers;`
      )

      fs.writeFileSync(outFilePath, codeString)
      const escapeCode = function (string) {
        return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
          // Escape all characters not included in SingleStringCharacters and
          // DoubleStringCharacters on
          // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
          switch (character) {
            case '"':
            case "'":
            case '\\':
              return '\\' + character
            // Four possible LineTerminator characters need to be escaped:
            case '\n':
              return '\\n'
            case '\r':
              return '\\r'
            case '\u2028':
              return '\\u2028'
            case '\u2029':
              return '\\u2029'
          }
        })
      }
      const codeEscaped =escapeCode(codeString)

      const indexMjs = `export const multiSigActionSource = "${codeEscaped}"`
      fs.writeFileSync(`${outDir}/index.mjs`, indexMjs)
      const indexJs = `exports.multiSigActionSource = "${codeEscaped}"`
      fs.writeFileSync(`${outDir}/index.js`, indexJs)
      const decl = `declare module '@refactor-labs-lit-protocol/lit-actions';`
      fs.writeFileSync(`${outDir}/index.d.ts`, decl)
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