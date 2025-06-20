export const ethRegex = new RegExp(/^0x[a-fA-F0-9]{40}$/);

export const ensRegex = new RegExp(/^([a-z0-9]+\.[a-z0-9]*\.)?ens$/);

export function isValidEthereumAddress(input) {
    const regexEthAddress = /^(0x)?[0-9a-fA-F]{40}$/;
    const regexEnsAddress = /^[a-z0-9]+\.eth$/;
    return regexEthAddress.test(input) || regexEnsAddress.test(input);
}
