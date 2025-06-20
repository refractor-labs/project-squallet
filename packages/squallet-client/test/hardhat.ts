import { spawn } from 'child_process';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hardhatRpcPort = '8545';
const hardhatRpcUrl = 'http://127.0.0.1:8545';

export const startHardhatNode = async () => {
    const hardhatProcess = spawn('npx', ['hardhat', 'node', '--port', hardhatRpcPort], {
        detached: true,
    });
    let i = 0;
    const buffers = [];
    if (!hardhatProcess.stdout) {
        throw new Error('no stdout');
    }
    for await (const data of hardhatProcess.stdout) {
        buffers.push(data);
        const finalBuffer = Buffer.concat(buffers);
        const str = finalBuffer.toString();
        if (str.includes(`Account #11`)) {
            break;
        }
        i++;
        if (i > 40) {
            throw new Error('hardhat node did not start');
        }
        await sleep(250);
    }
    console.log('i', i);
    const finalBuffer = Buffer.concat(buffers);
    const str = finalBuffer.toString();
    const re = /Account \#\d+: (0x[a-fA-F0-9]{40}).+\sPrivate Key:\s+(0x[a-fA-F0-9]{64})/g;
    let matches;

    const accounts: { privateKey: string; address: string }[] = [];
    do {
        matches = re.exec(str);
        if (matches) {
            const [match, address, privateKey] = matches;
            accounts.push({ privateKey, address });
        }
    } while (matches);
    if (accounts.length < 10) {
        throw new Error('not enough accounts');
    }
    console.log('hardhatProcess', hardhatProcess.pid);
    process.env.JSON_RPC_PROVIDER_URL = hardhatRpcUrl;

    return { hardhatProcess, hardhatRpcUrl, accounts };
};
