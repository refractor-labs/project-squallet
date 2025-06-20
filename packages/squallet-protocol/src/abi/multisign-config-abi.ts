export const multisigConfigAbi = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'pkpId',
                type: 'uint256',
            },
            {
                internalType: 'address[]',
                name: 'newOwners',
                type: 'address[]',
            },
            {
                internalType: 'uint256',
                name: 'newThreshold',
                type: 'uint256',
            },
        ],
        name: 'changeOwnersAndThreshold',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'pkpId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'newThreshold',
                type: 'uint256',
            },
        ],
        name: 'changeThreshold',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'pkpId',
                type: 'uint256',
            },
        ],
        name: 'getConfig',
        outputs: [
            {
                internalType: 'address[]',
                name: 'owners',
                type: 'address[]',
            },
            {
                internalType: 'uint256',
                name: 'threshold',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'pkpId',
                type: 'uint256',
            },
        ],
        name: 'governanceVersion',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
