import { useLocalStorage } from 'usehooks-ts'

export const usePublicKey = () => useLocalStorage('publicKey', '')
export const usePkpId = () => useLocalStorage('pkpId', '')
export const usePkpAddress = () => useLocalStorage('address', '')
