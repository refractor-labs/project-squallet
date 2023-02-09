import EIP155Lib, {EIP155PkpLib, IEIP155Lib} from '@/lib/EIP155Lib'

export let wallet1: IEIP155Lib
export let wallet2: IEIP155Lib
export let eip155Wallets: Record<string, IEIP155Lib>
export let eip155Addresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export async function createOrRestoreEIP155Wallet() {
    const mnemonic1 = localStorage.getItem('EIP155_MNEMONIC_1')
    const mnemonic2 = localStorage.getItem('EIP155_MNEMONIC_2')

    if (mnemonic1 && mnemonic2) {
        wallet1 = EIP155Lib.init({mnemonic: mnemonic1})
        wallet2 = EIP155Lib.init({mnemonic: mnemonic2})
    } else {
        wallet1 = EIP155Lib.init({})
        wallet2 = EIP155Lib.init({})

        // Don't store mnemonic in local storage in a production project!
        localStorage.setItem('EIP155_MNEMONIC_1', wallet1.getMnemonic())
        localStorage.setItem('EIP155_MNEMONIC_2', wallet2.getMnemonic())
    }

    address1 = await wallet1.getAddress()
    address2 =await  wallet2.getAddress()

    eip155Wallets = {
        [address1]: wallet1,
        [address2]: wallet2
    }
    eip155Addresses = Object.keys(eip155Wallets)

    return {
        eip155Wallets,
        eip155Addresses
    }
}

export async function restorePkpWallet() {
    const address = localStorage.getItem('PKP_ADDRESS')
    if (address) {
        wallet1 = EIP155PkpLib.init({address: address})
    } else {
        //init new wallet?
        wallet1 = EIP155PkpLib.init({address: '0x7e274423C0ab23841a31a01c66C96d22AD9326f6'})
        localStorage.setItem('PKP_ADDRESS', await wallet1.getAddress())
    }
    address1 = await wallet1.getAddress()
    // if (address) {
    //   wallet1 = EIP155Lib.init({ mnemonic: mnemonic1 })
    //   wallet2 = EIP155Lib.init({ mnemonic: mnemonic2 })
    // } else {
    //   wallet1 = EIP155Lib.init({})
    //   wallet2 = EIP155Lib.init({})
    //
    //   // Don't store mnemonic in local storage in a production project!
    //   localStorage.setItem('EIP155_MNEMONIC_1', wallet1.getMnemonic())
    //   localStorage.setItem('EIP155_MNEMONIC_2', wallet2.getMnemonic())
    // }
    //
    // address1 = wallet1.getAddress()
    // address2 = wallet2.getAddress()
    //
    eip155Wallets = {
      [address1]: wallet1,
      [address2]: wallet2
    }
    eip155Addresses = Object.keys(eip155Wallets)

    return {
        eip155Wallets,
        eip155Addresses
    }
}
