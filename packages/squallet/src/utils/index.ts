import { multiSigActionSource } from '@refactor-labs-lit-protocol/lit-actions'

export const replaceSignersInCode = async (signers: string[], threshold: number) => {
  const compiledCode = multiSigActionSource
  let code = compiledCode.replace('var threshold = 11337012321;', `var threshold = ${threshold};`)
  const signersString = signers
    .map(signer => {
      return `"${signer}"`
    })
    .join(', ')
  code = code.replace('"%%OWNER_ADDRESS%%"', signersString)
  return code
}
