const go = async () => {
  const results = {}
  const tokenId = Lit.Actions.pubkeyToTokenId({ publicKey })
  results.tokenId = tokenId
  // let's lookup some permissions
  const isPermittedAction = await Lit.Actions.isPermittedAction({
    tokenId,
    ipfsId: 'QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm'
  })
  results.isPermittedAction = isPermittedAction
  const isPermittedAddress = await Lit.Actions.isPermittedAddress({
    tokenId,
    address: Lit.Auth.authSigAddress
  })
  results.isPermittedAddress = isPermittedAddress
  const userId = uint8arrayFromString('testing', 'utf8')
  const isPermittedAuthMethod = await Lit.Actions.isPermittedAuthMethod({
    tokenId,
    authMethodType: '2',
    userId
  })
  results.isPermittedAuthMethod = isPermittedAuthMethod
  const permittedActions = await Lit.Actions.getPermittedActions({ tokenId })
  results.permittedActions = permittedActions
  const permittedAddresses = await Lit.Actions.getPermittedAddresses({ tokenId })
  results.permittedAddresses = permittedAddresses
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId })
  results.permittedAuthMethods = JSON.stringify(permittedAuthMethods)
  const permittedAuthMethodScopes = await Lit.Actions.getPermittedAuthMethodScopes({
    tokenId,
    authMethodType: '2',
    userId,
    maxScopeId: 10
  })
  results.permittedAuthMethodScopes = JSON.stringify(permittedAuthMethodScopes)
  Lit.Actions.setResponse({ response: JSON.stringify(results) })
}
go()
